import unittest
import json
import http.client

# http://127.0.0.1:8090/_/

class TestRequest(unittest.TestCase):
    def test_request(self):
        conn = http.client.HTTPConnection("localhost", 8090)

        url = "/api/collections/service_category/records"

        payload = json.dumps({
            "name": "testdfadfdd",
        })

        headers = { "Content-Type": "application/json" }

        try:
            conn.request("POST", url, body=payload, headers=headers)
            res = conn.getresponse()
            data = res.read().decode()
        except Exception as e:
            self.fail(f"Request failed: {e}")
        finally:
            conn.close()

        try:
            formatted = json.dumps(json.loads(data), indent=2)
            print("Formatted JSON response:")
            print(formatted)
        except Exception:
            print("Raw response:")
            print(data)


if __name__ == "__main__":
    unittest.main()
