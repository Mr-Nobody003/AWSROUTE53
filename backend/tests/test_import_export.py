import pytest

@pytest.fixture
def zone_id(auth_client):
    res = auth_client.post("/api/v1/zones", json={"name": "testzone.com", "type": "Public"})
    return res.json()["id"]

def test_export_bind(auth_client, zone_id):
    auth_client.post(f"/api/v1/zones/{zone_id}/records", json={
        "name": "www.testzone.com",
        "type": "A",
        "ttl": 300,
        "value": "10.0.0.1",
        "routing_policy": "simple"
    })
    
    response = auth_client.get(f"/api/v1/zones/{zone_id}/export?format=bind")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "www" in response.text
    assert "10.0.0.1" in response.text

def test_export_json(auth_client, zone_id):
    response = auth_client.get(f"/api/v1/zones/{zone_id}/export?format=json")
    assert response.status_code == 200
    data = response.json()
    assert "zone" in data
    assert "records" in data
    assert data["zone"]["name"] == "testzone.com"

def test_import_bind(auth_client, zone_id):
    bind_content = """
$ORIGIN testzone.com.
$TTL 86400
@   IN  SOA ns1.example.com. admin.example.com. ( 20240101 7200 3600 1209600 86400 )
@   IN  NS  ns1.example.com.
www IN  A   192.168.1.100
ftp IN  CNAME www.testzone.com.
"""
    files = {"file": ("test.bind", bind_content, "text/plain")}
    response = auth_client.post(f"/api/v1/zones/{zone_id}/import", files=files)
    assert response.status_code == 201
    data = response.json()
    assert "message" in data
    
    # Verify records were created
    get_res = auth_client.get(f"/api/v1/zones/{zone_id}/records")
    records = get_res.json()["items"]
    assert any(r["name"] == "www.testzone.com" and r["type"] == "A" for r in records)
    assert any(r["name"] == "ftp.testzone.com" and r["type"] == "CNAME" for r in records)
