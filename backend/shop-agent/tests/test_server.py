import http.client
import importlib.util
import json
import os
import pathlib
import threading
import unittest
from http.server import HTTPServer


ROOT = pathlib.Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "src" / "server.py"

spec = importlib.util.spec_from_file_location("shop_agent_server", SERVER_PATH)
server = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(server)


class ShopAgentServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ["AGENT_AUTH_TOKEN"] = "test-token"
        os.environ["STORE_ID"] = "shop-001"
        os.environ["SHOP_AGENT_VERSION"] = "0.1.0"
        os.environ["DEPLOYMENT_VERSION"] = "ci"

        cls.httpd = HTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.httpd.server_address[1]
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)

    def setUp(self) -> None:
        server.reset_state_for_tests()

    def request(self, method: str, path: str, authorized: bool = False) -> tuple[int, dict]:
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        headers = {"Content-Type": "application/json", "X-Actor-Id": "test-suite"}
        if authorized:
            headers["Authorization"] = "Bearer test-token"
        conn.request(method, path, body="{}", headers=headers)
        resp = conn.getresponse()
        data = json.loads(resp.read().decode("utf-8"))
        conn.close()
        return resp.status, data

    def assert_common_success(self, payload: dict) -> None:
        self.assertEqual(payload["status"], "success")
        self.assertIn("request_id", payload)
        self.assertIn("timestamp", payload)
        self.assertIn("message", payload)

    def assert_common_failure(self, payload: dict) -> None:
        self.assertEqual(payload["status"], "failure")
        self.assertIn("request_id", payload)
        self.assertIn("timestamp", payload)
        self.assertIn("message", payload)
        self.assertIn("error_code", payload)
        self.assertIn("retryable", payload)

    def test_health_is_public(self) -> None:
        code, payload = self.request("GET", "/health", authorized=False)
        self.assertEqual(code, 200)
        self.assert_common_success(payload)
        self.assertEqual(payload["component"], "shop-agent")
        self.assertEqual(payload["store_id"], "shop-001")

    def test_status_requires_auth(self) -> None:
        code, payload = self.request("GET", "/status", authorized=False)
        self.assertEqual(code, 401)
        self.assert_common_failure(payload)
        self.assertEqual(payload["error_code"], "UNAUTHORIZED")

    def test_status_with_auth_has_allowed_fields(self) -> None:
        code, payload = self.request("GET", "/status", authorized=True)
        self.assertEqual(code, 200)
        self.assert_common_success(payload)
        self.assertEqual(payload["agent_version"], "0.1.0")
        self.assertEqual(payload["store_id"], "shop-001")
        self.assertEqual(payload["deployment_version"], "ci")
        self.assertIn("last_successful_operation_timestamp", payload)
        self.assertIn("component_states", payload)

    def test_allowlisted_ops_return_success(self) -> None:
        routes = [
            "/ops/cache/flush",
            "/ops/index/reindex",
            "/ops/cron/run",
            "/ops/diagnostics",
            "/verify/smoke",
        ]
        for route in routes:
            with self.subTest(route=route):
                code, payload = self.request("POST", route, authorized=True)
                self.assertEqual(code, 200)
                self.assert_common_success(payload)
                self.assertEqual(payload["store_id"], "shop-001")
                self.assertIn("operation", payload)
                self.assertIn("operation_timestamp", payload)

    def test_operation_updates_last_success_timestamp(self) -> None:
        code, _ = self.request("POST", "/ops/cache/flush", authorized=True)
        self.assertEqual(code, 200)

        code, status_payload = self.request("GET", "/status", authorized=True)
        self.assertEqual(code, 200)
        self.assertIsNotNone(status_payload["last_successful_operation_timestamp"])

    def test_verify_smoke_response_contains_summary(self) -> None:
        code, payload = self.request("POST", "/verify/smoke", authorized=True)
        self.assertEqual(code, 200)
        self.assert_common_success(payload)
        self.assertEqual(payload["smoke"]["result"], "pass")
        self.assertGreaterEqual(len(payload["smoke"]["checks"]), 1)

    def test_unknown_route_returns_not_found(self) -> None:
        code, payload = self.request("GET", "/unknown", authorized=True)
        self.assertEqual(code, 404)
        self.assert_common_failure(payload)
        self.assertEqual(payload["error_code"], "NOT_FOUND")

    def test_unsupported_method_returns_method_not_allowed(self) -> None:
        code, payload = self.request("PUT", "/health", authorized=True)
        self.assertEqual(code, 405)
        self.assert_common_failure(payload)
        self.assertEqual(payload["error_code"], "METHOD_NOT_ALLOWED")


if __name__ == "__main__":
    unittest.main()
