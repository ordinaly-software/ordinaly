from django.test import TestCase

# Create your tests here.


class ApiDocsTests(TestCase):
    """The OpenAPI docs are public: no token needed to read them."""

    def test_schema_and_docs_are_public(self):
        for url in ("/api/schema/", "/api/docs/", "/api/redoc/"):
            self.assertEqual(self.client.get(url).status_code, 200, url)
