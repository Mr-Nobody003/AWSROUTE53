def test_create_zone(auth_client):
    response = auth_client.post("/api/v1/zones", json={
        "name": "example.com",
        "type": "Public",
        "comment": "Test zone"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "example.com"
    assert "id" in data
    assert data["id"].startswith("Z")

def test_create_duplicate_zone(auth_client):
    auth_client.post("/api/v1/zones", json={"name": "example.com", "type": "Public"})
    response = auth_client.post("/api/v1/zones", json={"name": "example.com", "type": "Public"})
    assert response.status_code == 400

def test_get_zones(auth_client):
    auth_client.post("/api/v1/zones", json={"name": "example1.com", "type": "Public"})
    auth_client.post("/api/v1/zones", json={"name": "example2.com", "type": "Private"})
    
    response = auth_client.get("/api/v1/zones")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

def test_delete_zone(auth_client):
    # Create zone
    create_res = auth_client.post("/api/v1/zones", json={"name": "example.com", "type": "Public"})
    zone_id = create_res.json()["id"]
    
    # Delete zone
    delete_res = auth_client.delete(f"/api/v1/zones/{zone_id}")
    assert delete_res.status_code == 204
    
    # Verify deletion
    get_res = auth_client.get(f"/api/v1/zones/{zone_id}")
    assert get_res.status_code == 404

def test_delete_zone_with_custom_records(auth_client):
    # Create zone
    create_res = auth_client.post("/api/v1/zones", json={"name": "example.com", "type": "Public"})
    zone_id = create_res.json()["id"]
    
    # Add a custom record
    auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "www.example.com",
        "type": "A",
        "ttl": 300,
        "value": "1.2.3.4",
        "routing_policy": "simple"
    })
    
    # Try to delete zone normally (should fail)
    delete_res = auth_client.delete(f"/api/v1/zones/{zone_id}")
    assert delete_res.status_code == 409
    
    # Delete with force
    delete_res_force = auth_client.delete(f"/api/v1/zones/{zone_id}?force=true")
    assert delete_res_force.status_code == 204
