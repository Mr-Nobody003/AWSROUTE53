import pytest

@pytest.fixture
def zone_id(auth_client):
    res = auth_client.post("/api/v1/zones", json={"name": "example.com", "type": "Public"})
    return res.json()["id"]

def test_create_record(auth_client, zone_id):
    response = auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "www.example.com",
        "type": "A",
        "ttl": 300,
        "value": "1.2.3.4",
        "routing_policy": "simple"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "www.example.com"
    assert data["type"] == "A"
    assert data["value"] == "1.2.3.4"

def test_create_record_invalid_value(auth_client, zone_id):
    response = auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "www.example.com",
        "type": "A",
        "ttl": 300,
        "value": "not-an-ip",
        "routing_policy": "simple"
    })
    assert response.status_code == 422 # Pydantic validation error

def test_cname_conflict(auth_client, zone_id):
    # Create CNAME
    auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "app.example.com",
        "type": "CNAME",
        "ttl": 300,
        "value": "www.example.com",
        "routing_policy": "simple"
    })
    
    # Try to create another record with the same name
    response = auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "app.example.com",
        "type": "A",
        "ttl": 300,
        "value": "1.2.3.4",
        "routing_policy": "simple"
    })
    assert response.status_code == 400

def test_update_record(auth_client, zone_id):
    create_res = auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "mail.example.com",
        "type": "A",
        "ttl": 300,
        "value": "1.2.3.4",
        "routing_policy": "simple"
    })
    record_id = create_res.json()["id"]
    
    update_res = auth_client.put(f"/api/v1/zones/{zone_id}/records/{record_id}", json={
        "value": "5.6.7.8",
        "ttl": 600
    })
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["value"] == "5.6.7.8"
    assert data["ttl"] == 600

def test_delete_default_record_fails(auth_client, zone_id):
    # Get the default SOA record
    get_res = auth_client.get(f"/api/v1/zones/{zone_id}/records")
    records = get_res.json()["items"]
    soa_record = next(r for r in records if r["type"] == "SOA")
    
    delete_res = auth_client.delete(f"/api/v1/zones/{zone_id}/records/{soa_record['id']}")
    assert delete_res.status_code == 403
