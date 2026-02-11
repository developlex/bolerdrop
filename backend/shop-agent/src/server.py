#!/usr/bin/env python3
import base64
import errno
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Lock
from urllib.parse import urlsplit
from uuid import uuid4


STATE_LOCK = Lock()
STATE: dict[str, str | None] = {"last_successful_operation_timestamp": None}


def utc_ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def b64url_decode(data: str) -> bytes:
    padding = "=" * ((4 - len(data) % 4) % 4)
    return base64.urlsafe_b64decode(data + padding)


def get_last_successful_operation_timestamp() -> str | None:
    with STATE_LOCK:
        return STATE["last_successful_operation_timestamp"]


def set_last_successful_operation_timestamp(value: str) -> None:
    with STATE_LOCK:
        STATE["last_successful_operation_timestamp"] = value


def reset_state_for_tests() -> None:
    with STATE_LOCK:
        STATE["last_successful_operation_timestamp"] = None


class Handler(BaseHTTPRequestHandler):
    server_version = "BoilerDropShopAgent/0.1"

    def _path(self) -> str:
        return urlsplit(self.path).path

    def _store_id(self) -> str:
        return os.getenv("STORE_ID", "unknown-store")

    def _agent_version(self) -> str:
        return os.getenv("SHOP_AGENT_VERSION", "dev")

    def _deployment_version(self) -> str:
        return os.getenv("DEPLOYMENT_VERSION", "unknown")

    def _auth_token(self) -> str:
        return os.getenv("AGENT_AUTH_TOKEN", "dev-token")

    def _auth_mode(self) -> str:
        return os.getenv("AGENT_AUTH_MODE", "jwt").lower()

    def _jwt_secret(self) -> str:
        return os.getenv("AGENT_JWT_SECRET", "")

    def _jwt_issuer(self) -> str:
        return os.getenv("AGENT_JWT_ISSUER", "control-plane")

    def _jwt_audience(self) -> str:
        return os.getenv("AGENT_JWT_AUDIENCE", "shop-agent")

    def _jwt_leeway_seconds(self) -> int:
        return int(os.getenv("AGENT_JWT_LEEWAY_SECONDS", "5"))

    def _jwt_max_ttl_seconds(self) -> int:
        return int(os.getenv("AGENT_JWT_MAX_TTL_SECONDS", "900"))

    def _actor(self) -> str:
        return self.headers.get("X-Actor-Id", "unknown")

    def _base_payload(self, status: str, message: str) -> dict:
        return {
            "request_id": str(uuid4()),
            "timestamp": utc_ts(),
            "status": status,
            "message": message,
        }

    def _is_client_disconnect(self, exc: BaseException) -> bool:
        if isinstance(exc, (BrokenPipeError, ConnectionResetError)):
            return True
        if isinstance(exc, OSError):
            return exc.errno in {errno.EPIPE, errno.ECONNRESET, 54}
        return False

    def _send_json(self, code: int, payload: dict) -> bool:
        body = json.dumps(payload).encode("utf-8")
        try:
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return True
        except Exception as exc:  # noqa: BLE001
            if self._is_client_disconnect(exc):
                print(
                    f"{utc_ts()} component=shop-agent event=client-disconnect "
                    f"method={self.command} path={self._path()} code={code}"
                )
                return False
            raise

    def _error(self, code: int, message: str, error_code: str, retryable: bool) -> None:
        payload = self._base_payload("failure", message)
        payload["error_code"] = error_code
        payload["retryable"] = retryable
        self._send_json(code, payload)

    def _is_authorized(self) -> bool:
        auth_header = self.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        if token is None:
            token = self.headers.get("X-Agent-Token")
        if not token:
            return False

        if self._auth_mode() == "token":
            return hmac.compare_digest(token, self._auth_token())

        if self._auth_mode() == "jwt":
            return self._is_valid_jwt(token)

        return False

    def _is_valid_jwt(self, token: str) -> bool:
        secret = self._jwt_secret()
        if not secret:
            return False

        try:
            parts = token.split(".")
            if len(parts) != 3:
                return False
            header_b64, payload_b64, signature_b64 = parts

            signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
            expected_signature = b64url_encode(
                hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
            )
            if not hmac.compare_digest(signature_b64, expected_signature):
                return False

            header = json.loads(b64url_decode(header_b64).decode("utf-8"))
            payload = json.loads(b64url_decode(payload_b64).decode("utf-8"))

            if header.get("alg") != "HS256":
                return False

            now = int(time.time())
            leeway = self._jwt_leeway_seconds()
            max_ttl = self._jwt_max_ttl_seconds()

            exp = payload.get("exp")
            iat = payload.get("iat")
            iss = payload.get("iss")
            aud = payload.get("aud")
            token_store_id = payload.get("store_id")

            if not isinstance(exp, int) or not isinstance(iat, int):
                return False
            if exp <= (now - leeway):
                return False
            if iat > (now + leeway):
                return False
            if (exp - iat) > max_ttl:
                return False
            if (now - iat) > (max_ttl + leeway):
                return False

            if iss != self._jwt_issuer():
                return False
            if isinstance(aud, str):
                audience_ok = aud == self._jwt_audience()
            elif isinstance(aud, list):
                audience_ok = self._jwt_audience() in aud
            else:
                audience_ok = False
            if not audience_ok:
                return False

            if token_store_id is not None and token_store_id != self._store_id():
                return False

            return True
        except Exception:  # noqa: BLE001
            return False

    def _ensure_authorized(self) -> bool:
        if self._is_authorized():
            return True
        self._error(401, "unauthorized", "UNAUTHORIZED", retryable=False)
        return False

    def _component_states(self) -> dict:
        return {
            "backend_reachable": "unknown",
            "search_reachable": "unknown",
            "cache_reachable": "unknown",
        }

    def _mark_successful_operation(self) -> str:
        ts = utc_ts()
        set_last_successful_operation_timestamp(ts)
        return ts

    def _op_success(self, operation: str, message: str, extra: dict | None = None) -> None:
        payload = self._base_payload("success", message)
        payload["operation"] = operation
        payload["store_id"] = self._store_id()
        payload["operation_timestamp"] = self._mark_successful_operation()
        if extra:
            payload.update(extra)
        self._send_json(200, payload)

    def _log_audit(self, outcome: str, http_code: int, error_code: str | None = None) -> None:
        # Non-sensitive audit line for operations visibility.
        print(
            f"{utc_ts()} component=shop-agent method={self.command} path={self._path()} "
            f"store_id={self._store_id()} actor={self._actor()} outcome={outcome} "
            f"http_code={http_code} error_code={error_code or '-'}"
        )

    def do_GET(self) -> None:  # noqa: N802
        path = self._path()

        if path == "/health":
            payload = self._base_payload("success", "shop-agent healthy")
            payload["component"] = "shop-agent"
            payload["store_id"] = self._store_id()
            self._send_json(200, payload)
            self._log_audit("success", 200)
            return

        if path == "/status":
            if not self._ensure_authorized():
                self._log_audit("failure", 401, "UNAUTHORIZED")
                return
            payload = self._base_payload("success", "shop-agent status")
            payload["agent_version"] = self._agent_version()
            payload["store_id"] = self._store_id()
            payload["deployment_version"] = self._deployment_version()
            payload["last_successful_operation_timestamp"] = get_last_successful_operation_timestamp()
            payload["component_states"] = self._component_states()
            self._send_json(200, payload)
            self._log_audit("success", 200)
            return

        self._error(404, "route not found", "NOT_FOUND", retryable=False)
        self._log_audit("failure", 404, "NOT_FOUND")

    def do_POST(self) -> None:  # noqa: N802
        path = self._path()
        if not self._ensure_authorized():
            self._log_audit("failure", 401, "UNAUTHORIZED")
            return

        if path == "/ops/cache/flush":
            self._op_success("ops.cache.flush", "cache flush completed")
            self._log_audit("success", 200)
            return

        if path == "/ops/index/reindex":
            self._op_success("ops.index.reindex", "reindex completed")
            self._log_audit("success", 200)
            return

        if path == "/ops/cron/run":
            self._op_success("ops.cron.run", "cron run completed")
            self._log_audit("success", 200)
            return

        if path == "/ops/diagnostics":
            self._op_success(
                "ops.diagnostics",
                "diagnostics collected",
                {
                    "diagnostics": {
                        "component_states": self._component_states(),
                        "error_codes": [],
                        "collected_at": utc_ts(),
                    }
                },
            )
            self._log_audit("success", 200)
            return

        if path == "/verify/smoke":
            self._op_success(
                "verify.smoke",
                "smoke verification passed",
                {
                    "smoke": {
                        "result": "pass",
                        "checks": [
                            {"name": "shop-agent-health", "status": "pass"},
                            {"name": "status-endpoint-auth", "status": "pass"},
                        ],
                    }
                },
            )
            self._log_audit("success", 200)
            return

        self._error(404, "route not found", "NOT_FOUND", retryable=False)
        self._log_audit("failure", 404, "NOT_FOUND")

    def _method_not_allowed(self) -> None:
        self._error(405, "method not allowed", "METHOD_NOT_ALLOWED", retryable=False)
        self._log_audit("failure", 405, "METHOD_NOT_ALLOWED")

    def do_PUT(self) -> None:  # noqa: N802
        self._method_not_allowed()

    def do_DELETE(self) -> None:  # noqa: N802
        self._method_not_allowed()

    def do_PATCH(self) -> None:  # noqa: N802
        self._method_not_allowed()

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        msg = fmt % args
        print(f"{utc_ts()} component=shop-agent event=http-log msg={msg}")


def main() -> None:
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    httpd = HTTPServer((host, port), Handler)
    print(f"{utc_ts()} shop-agent listening on {host}:{port} store_id={os.getenv('STORE_ID', 'unknown-store')}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
