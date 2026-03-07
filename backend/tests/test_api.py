import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base
from app import models
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

TEST_DATABASE_URL = "postgresql://postgres:0000@localhost:5432/diary_test"
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=test_engine)
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

# Auth tests
def test_register():
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    response = client.post("/auth/register", json={
        "username": unique_username,
        "password": "testpass"
    })
    assert response.status_code == 200
    assert response.json()["username"] == unique_username

def test_login():
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "wrongpass"})
    assert response.status_code == 401

# Items tests
def get_token():
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    return response.json()["access_token"]

def test_create_item():
    token = get_token()
    response = client.post("/items/",
        json={"name": "The Witcher", "type": "game"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "The Witcher"


def test_get_items():
    token = get_token()
    response = client.get("/items/", headers={"Authorization": f"Bearer {token}"})
    initial_count = len(response.json())

    client.post("/items/",
                json={"name": "The Witcher", "type": "game"},
                headers={"Authorization": f"Bearer {token}"}
                )
    response = client.get("/items/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) == initial_count + 1

def test_delete_item():
    token = get_token()
    create = client.post("/items/",
        json={"name": "The Witcher", "type": "game"},
        headers={"Authorization": f"Bearer {token}"}
    )
    item_id = create.json()["id"]
    response = client.delete(f"/items/{item_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_items_isolated_between_users():
    # User 1
    client.post("/auth/register", json={"username": "user1", "password": "pass1"})
    token1 = client.post("/auth/login", json={"username": "user1", "password": "pass1"}).json()["access_token"]
    client.post("/items/", json={"name": "Game 1", "type": "game"}, headers={"Authorization": f"Bearer {token1}"})

    # User 2
    client.post("/auth/register", json={"username": "user2", "password": "pass2"})
    token2 = client.post("/auth/login", json={"username": "user2", "password": "pass2"}).json()["access_token"]

    # User 2 should not see User 1's items
    response = client.get("/items/", headers={"Authorization": f"Bearer {token2}"})
    assert len(response.json()) == 0