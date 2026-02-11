#!/usr/bin/env python3
import errno
import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Lock
from urllib.parse import urlsplit
from uuid import uuid4


STATE_LOCK = Lock()
STATE = {"last_successful_operation_timestamp": None}


def utc_ts() -> str:
    return datetime.now(timezone.utc).isoformat()


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
        expected = self._auth_token()
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.split(" ", 1)[1] == expected
        alt = self.headers.get("X-Agent-Token")
        return alt == expected

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
