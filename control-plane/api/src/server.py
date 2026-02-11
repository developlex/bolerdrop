#!/usr/bin/env python3
import errno
import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from uuid import uuid4


def utc_ts() -> str:
    return datetime.now(timezone.utc).isoformat()


class Handler(BaseHTTPRequestHandler):
    server_version = "BoilerDropControlPlane/0.1"

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
                    f"{utc_ts()} component=control-plane-api event=client-disconnect "
                    f"method={self.command} path={self.path} code={code}"
                )
                return False
            raise

    def _base_payload(self, status: str, message: str) -> dict:
        return {
            "request_id": str(uuid4()),
            "timestamp": utc_ts(),
            "status": status,
            "message": message,
        }

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            payload = self._base_payload("success", "control-plane-api healthy")
            payload["component"] = "control-plane-api"
            self._send_json(200, payload)
            return

        if self.path == "/status":
            payload = self._base_payload("success", "control-plane status")
            payload["component"] = "control-plane-api"
            payload["version"] = os.getenv("CONTROL_PLANE_VERSION", "dev")
            payload["deployment_version"] = os.getenv("DEPLOYMENT_VERSION", "unknown")
            self._send_json(200, payload)
            return

        payload = self._base_payload("failure", "route not found")
        payload["error_code"] = "NOT_FOUND"
        payload["retryable"] = False
        self._send_json(404, payload)

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        # Keep logs structured-ish and avoid noisy default format.
        msg = fmt % args
        print(f"{utc_ts()} method={self.command} path={self.path} msg={msg}")


def main() -> None:
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    httpd = HTTPServer((host, port), Handler)
    print(f"{utc_ts()} control-plane-api listening on {host}:{port}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
