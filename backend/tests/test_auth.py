def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={"username": "testadmin", "password": "testpass"})
    assert response.status_code == 200
    assert "access_token" in response.cookies

def test_login_failure(client):
    response = client.post("/api/v1/auth/login", json={"username": "testadmin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_get_me(auth_client):
    response = auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "testadmin"

def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_logout(auth_client):
    response = auth_client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    
    # Verify cookie is cleared by trying to access /me
    response = auth_client.get("/api/v1/auth/me")
    assert response.status_code == 401
