import sys
import os
import asyncio
from pathlib import Path

# Set UTF-8 encoding for stdout/stderr to avoid Windows cp1252 issues
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from fastapi.testclient import TestClient
from main import app
from services.memory_service import memory_service
from services.orchestrator_service import orchestrator
from services.omi_service import omi_service

client = TestClient(app)

errors = []
passes = []

def record_result(test_name: str, passed: bool, error_msg: str = ""):
    if passed:
        passes.append(test_name)
        print(f"✅ PASS: {test_name}")
    else:
        errors.append((test_name, error_msg))
        print(f"❌ FAIL: {test_name} -> {error_msg}")

print("\n" + "="*70)
print("  MEETSIGHT BACKEND FUNCTIONALITY & ENDPOINT TEST SUITE")
print("="*70 + "\n")

# 1. Root & Health
try:
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "operational", "Status is not operational"
    record_result("API Root Endpoint (/)", True)
except Exception as e:
    record_result("API Root Endpoint (/)", False, str(e))

try:
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["qdrant"]["connected"] is True, "Qdrant is not connected"
    assert data["lyzr_orchestrator"]["ready"] is True, "Lyzr orchestrator not ready"
    record_result("Health Check Endpoint (/api/health)", True)
except Exception as e:
    record_result("Health Check Endpoint (/api/health)", False, str(e))

# 2. Qdrant Memory Service
try:
    stats = memory_service.get_memory_stats()
    assert "total_memory_points" in stats, "total_memory_points missing in stats"
    assert "vector_dimension" in stats and stats["vector_dimension"] == 384, f"Vector dim != 384: {stats}"
    record_result("Qdrant Memory Stats Inspection", True)
except Exception as e:
    record_result("Qdrant Memory Stats Inspection", False, str(e))

try:
    # Test embedding generation
    test_vecs = memory_service.embed_texts(["OAuth authentication with refresh token"])
    assert len(test_vecs) == 1, "Expected 1 vector"
    assert len(test_vecs[0]) == 384, f"Expected dim 384, got {len(test_vecs[0])}"
    record_result("FastEmbed 384-d Embedding Generation", True)
except Exception as e:
    record_result("FastEmbed 384-d Embedding Generation", False, str(e))

# 3. Meeting Storage & Direct Search
try:
    test_meeting_id = memory_service.store_meeting({
        "title": "Backend Architecture Sync (Automated Test)",
        "date": "2026-10-06T12:00:00Z",
        "transcript": "Rahul: We confirmed OAuth2 for authentication. Alex will configure PostgreSQL database and Docker containers by Wednesday.",
        "summary": {
            "overview": "Team aligned on OAuth2 and PostgreSQL infrastructure.",
            "key_points": ["OAuth2 confirmed", "PostgreSQL setup assigned to Alex"],
            "sentiment": "Constructive",
            "topics": ["Architecture", "Database"]
        },
        "decisions": [
            {"text": "Confirmed OAuth2 for user authentication", "rationale": "Security standards", "status": "approved", "category": "Architecture"}
        ],
        "action_items": [
            {"task": "Configure PostgreSQL database and Docker containers", "assignee": "Alex", "priority": "high", "deadline": "Wednesday"}
        ],
        "risks": [
            {"description": "AWS credit approval delay", "severity": "critical", "suggested_mitigation": "Follow up with finance"}
        ]
    })
    assert test_meeting_id is not None, "Failed to return meeting_id"
    record_result("Qdrant Meeting Store & Indexing", True)
except Exception as e:
    record_result("Qdrant Meeting Store & Indexing", False, str(e))

try:
    search_hits = memory_service.search_memory("OAuth authentication", limit=3)
    assert len(search_hits) > 0, "No hits returned for 'OAuth authentication'"
    assert search_hits[0]["score"] > 0.4, f"Low similarity score: {search_hits[0]['score']}"
    record_result("Qdrant Cosine Similarity Vector Search", True)
except Exception as e:
    record_result("Qdrant Cosine Similarity Vector Search", False, str(e))

# 4. Lyzr Multi-Agent DAG Execution
try:
    dag_events = []
    sample_text = (
        "Sarah: Let us confirm the Sprint 4 deadlines. We agreed to freeze the REST API by Thursday at 5 PM. "
        "David will implement the payment gateway integration using Stripe by Friday. "
        "Risk: Stripe account verification is still under review and could take 48 hours."
    )
    
    async def run_dag():
        return await orchestrator.execute_meeting_dag(
            transcript=sample_text,
            title="Sprint 4 Delivery Planning",
            event_callback=lambda evt: dag_events.append(evt)
        )
    
    dag_result = asyncio.run(run_dag())
    assert "summary" in dag_result, "Missing summary in DAG result"
    assert "decisions" in dag_result and len(dag_result["decisions"]) > 0, f"Decisions missing or empty: {dag_result.get('decisions')}"
    assert "action_items" in dag_result and len(dag_result["action_items"]) > 0, f"Action items missing or empty: {dag_result.get('action_items')}"
    assert "risks" in dag_result, "Risks missing in DAG result"
    assert len(dag_events) >= 6, f"Expected at least 6 DAG event updates, got {len(dag_events)}"
    record_result("Lyzr Multi-Agent DAG Execution & Event Flow", True)
except Exception as e:
    record_result("Lyzr Multi-Agent DAG Execution & Event Flow", False, str(e))

# 5. Cross-Meeting Q&A Agent
try:
    qa_resp = orchestrator.answer_cross_meeting_query("What did we decide about the REST API freeze deadline?")
    assert "answer" in qa_resp and len(qa_resp["answer"]) > 10, "Empty Q&A answer"
    assert len(qa_resp["citations"]) > 0, "No citations found in Qdrant for relevant query"
    record_result("Lyzr Contextual Q&A Agent with Qdrant Citations", True)
except Exception as e:
    record_result("Lyzr Contextual Q&A Agent with Qdrant Citations", False, str(e))

# 6. Omi Webhook Processing
try:
    omi_payload = {
        "session_id": "test_omi_session_999",
        "timestamp": "2026-10-06T15:30:00Z",
        "segments": [
            {"speaker": "Alice", "text": "We decided to deploy the frontend to Vercel."},
            {"speaker": "Bob", "text": "I will handle the DNS configuration by tomorrow."}
        ]
    }
    res = client.post("/api/omi/webhook", json=omi_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json()["status"] == "processed", "Webhook not processed"
    record_result("Omi Ambient Voice Webhook Endpoint (/api/omi/webhook)", True)
except Exception as e:
    record_result("Omi Ambient Voice Webhook Endpoint (/api/omi/webhook)", False, str(e))

# 7. HTTP API: Process Meeting Endpoint
try:
    res = client.post("/api/process-meeting", json={
        "transcript": "Elena: We have decided to use TailwindCSS for the client dashboard. Jordan will build the navigation bar by Tuesday.",
        "title": "Design System Sync"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["success"] is True, "process-meeting success is not True"
    assert "meeting" in data and data["meeting"]["id"], "Meeting ID missing in response"
    record_result("HTTP Meeting Processing (/api/process-meeting)", True)
except Exception as e:
    record_result("HTTP Meeting Processing (/api/process-meeting)", False, str(e))

# 8. HTTP API: Chat Endpoint
try:
    res = client.post("/api/chat", json={"query": "Who is building the navigation bar?"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "answer" in data and len(data["answer"]) > 5, "Chat answer missing"
    record_result("HTTP Chat Memory Query (/api/chat)", True)
except Exception as e:
    record_result("HTTP Chat Memory Query (/api/chat)", False, str(e))

# 9. HTTP API: Get Meetings & Search Memory
try:
    res = client.get("/api/meetings")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    meetings = res.json().get("meetings", [])
    assert len(meetings) > 0, "No meetings returned from /api/meetings"
    record_result("HTTP Historical Meetings List (/api/meetings)", True)
except Exception as e:
    record_result("HTTP Historical Meetings List (/api/meetings)", False, str(e))

try:
    res = client.post("/api/memory/search", json={"query": "PostgreSQL database"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    results = res.json().get("results", [])
    assert len(results) > 0, "No results returned for vector search"
    record_result("HTTP Vector Memory Search (/api/memory/search)", True)
except Exception as e:
    record_result("HTTP Vector Memory Search (/api/memory/search)", False, str(e))

print("\n" + "="*70)
print(f"TEST SUMMARY: {len(passes)} PASSED, {len(errors)} FAILED")
if errors:
    print("FAILED TESTS:")
    for name, err in errors:
        print(f" - {name}: {err}")
print("="*70 + "\n")
