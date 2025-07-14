import pytest
from fastapi.testclient import TestClient
from server.src.main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/admin/users", json={
        "email": "test@example.com",
        "password": "password",
        "firstName": "Test",
        "lastName": "User",
        "orgId": "some-org-id"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
