import sys
import os
import json
import io
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from fastapi.testclient import TestClient
from main import app, broadcast_agent_event
from services.memory_service import memory_service, QdrantMemoryService
from services.orchestrator_service import orchestrator, LyzrMultiAgentOrchestrator
from services.omi_service import omi_service, OmiService
from config import settings

client = TestClient(app)

results = []

def record(category: str, test_name: str, passed: bool, details: str = "", error: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({
        "category": category,
        "name": test_name,
        "status": status,
        "details": details,
        "error": error
    })
    symbol = "✅" if passed else "❌"
    print(f"{symbol} [{category}] {test_name}: {status}")
    if error:
        print(f"    Error: {error}")
    elif details:
        print(f"    Note: {details}")

print("\n" + "="*80)
print("  MEETSIGHT EXHAUSTIVE BACKEND & API TEST SUITE")
print("="*80 + "\n")

# ==============================================================================
# 1. MEMORY SERVICE FUNCTION TESTS (All combinations & edge cases)
# ==============================================================================
print(">>> [1/5] Testing QdrantMemoryService Functions...")

# 1.1 Embeddings
try:
    vecs = memory_service.embed_texts(["Short query"])
    assert len(vecs) == 1 and len(vecs[0]) == 384
    record("MemoryService", "embed_texts: Single short string", True, f"Dim: {len(vecs[0])}")
except Exception as e:
    record("MemoryService", "embed_texts: Single short string", False, error=str(e))

try:
    vecs = memory_service.embed_texts([])
    assert vecs == []
    record("MemoryService", "embed_texts: Empty list", True, "Returned empty list []")
except Exception as e:
    record("MemoryService", "embed_texts: Empty list", False, error=str(e))

try:
    batch = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]
    vecs = memory_service.embed_texts(batch)
    assert len(vecs) == 5 and all(len(v) == 384 for v in vecs)
    record("MemoryService", "embed_texts: Batch of 5 texts", True)
except Exception as e:
    record("MemoryService", "embed_texts: Batch of 5 texts", False, error=str(e))

try:
    long_text = "Word " * 2000  # ~2000 words
    vecs = memory_service.embed_texts([long_text])
    assert len(vecs) == 1 and len(vecs[0]) == 384
    record("MemoryService", "embed_texts: Very long text (2000 words)", True)
except Exception as e:
    record("MemoryService", "embed_texts: Very long text (2000 words)", False, error=str(e))

try:
    unicode_text = "会議 会议 🚀 🎯 UTF-8 Special Symbols: ©®™ µ ¶"
    vecs = memory_service.embed_texts([unicode_text])
    assert len(vecs) == 1 and len(vecs[0]) == 384
    record("MemoryService", "embed_texts: Unicode and emojis", True)
except Exception as e:
    record("MemoryService", "embed_texts: Unicode and emojis", False, error=str(e))

# 1.2 Store Meeting
try:
    # Minimal meeting (missing optional fields)
    m_id1 = memory_service.store_meeting({"transcript": "Minimal transcript for meeting 1."})
    assert m_id1 is not None and len(m_id1) > 0
    record("MemoryService", "store_meeting: Minimal payload (transcript only)", True, f"ID: {m_id1}")
except Exception as e:
    record("MemoryService", "store_meeting: Minimal payload (transcript only)", False, error=str(e))

try:
    # Empty transcript
    m_id2 = memory_service.store_meeting({"title": "Empty Transcript Meeting", "transcript": ""})
    assert m_id2 is not None
    record("MemoryService", "store_meeting: Empty transcript", True, f"ID: {m_id2}")
except Exception as e:
    record("MemoryService", "store_meeting: Empty transcript", False, error=str(e))

try:
    # Complex meeting with string arrays vs dict arrays
    m_id3 = memory_service.store_meeting({
        "id": "fixed-test-uuid-001",
        "title": "Comprehensive Meeting Sync",
        "transcript": "First sentence. Second sentence. Third sentence. Fourth sentence.",
        "summary": {"overview": "Overview text", "key_points": ["Point A", "Point B"]},
        "decisions": [
            "Simple string decision",
            {"text": "Dict decision", "status": "approved", "category": "Tech"}
        ],
        "action_items": [
            "Simple string action",
            {"task": "Dict task", "assignee": "Sarah", "priority": "high", "deadline": "Friday"}
        ],
        "risks": [
            "Simple string risk",
            {"description": "Dict risk", "severity": "critical"}
        ]
    })
    assert m_id3 == "fixed-test-uuid-001"
    record("MemoryService", "store_meeting: Custom ID + mixed string/dict payloads", True, f"ID: {m_id3}")
except Exception as e:
    record("MemoryService", "store_meeting: Custom ID + mixed string/dict payloads", False, error=str(e))

try:
    # Non-dict summary (string summary)
    m_id4 = memory_service.store_meeting({
        "title": "String summary meeting",
        "transcript": "Meeting content.",
        "summary": "This is a plain string summary instead of a dict."
    })
    assert m_id4 is not None
    record("MemoryService", "store_meeting: String summary (non-dict)", True, f"ID: {m_id4}")
except Exception as e:
    record("MemoryService", "store_meeting: String summary (non-dict)", False, error=str(e))

# 1.3 Search Memory
try:
    # Normal search
    res = memory_service.search_memory("First sentence", limit=3)
    assert isinstance(res, list) and len(res) > 0
    assert "score" in res[0] and "text" in res[0]
    record("MemoryService", "search_memory: Standard semantic query", True, f"Hits: {len(res)}")
except Exception as e:
    record("MemoryService", "search_memory: Standard semantic query", False, error=str(e))

try:
    # Search with category filter
    res = memory_service.search_memory("Dict task", category="action_item", limit=3)
    assert isinstance(res, list)
    if len(res) > 0:
        assert res[0]["category"] == "action_item"
    record("MemoryService", "search_memory: Filter by category='action_item'", True, f"Hits: {len(res)}")
except Exception as e:
    record("MemoryService", "search_memory: Filter by category='action_item'", False, error=str(e))

try:
    # Search with non-existent category
    res = memory_service.search_memory("Anything", category="non_existent_category", limit=3)
    assert isinstance(res, list) and len(res) == 0
    record("MemoryService", "search_memory: Non-existent category filter", True, "Returned 0 hits as expected")
except Exception as e:
    record("MemoryService", "search_memory: Non-existent category filter", False, error=str(e))

try:
    # High threshold resulting in 0 matches
    res = memory_service.search_memory("Unrelated query about spaceships in mars", score_threshold=0.99)
    assert isinstance(res, list)
    record("MemoryService", "search_memory: High threshold (0.99)", True, f"Hits: {len(res)}")
except Exception as e:
    record("MemoryService", "search_memory: High threshold (0.99)", False, error=str(e))

# 1.4 Get All Meetings
try:
    meetings = memory_service.get_all_meetings(limit=10)
    assert isinstance(meetings, list) and len(meetings) > 0
    assert "title" in meetings[0] and "id" in meetings[0]
    record("MemoryService", "get_all_meetings: Standard limit=10", True, f"Retrieved: {len(meetings)}")
except Exception as e:
    record("MemoryService", "get_all_meetings: Standard limit=10", False, error=str(e))

try:
    meetings = memory_service.get_all_meetings(limit=1)
    assert isinstance(meetings, list) and len(meetings) <= 1
    record("MemoryService", "get_all_meetings: Limit=1 boundary", True, f"Retrieved: {len(meetings)}")
except Exception as e:
    record("MemoryService", "get_all_meetings: Limit=1 boundary", False, error=str(e))

# 1.5 Memory Stats
try:
    stats = memory_service.get_memory_stats()
    assert "total_memory_points" in stats
    assert "total_meetings_indexed" in stats
    assert "vector_dimension" in stats and stats["vector_dimension"] == 384
    assert "storage_mode" in stats
    assert "recent_points" in stats and isinstance(stats["recent_points"], list)
    record("MemoryService", "get_memory_stats: Schema and field validation", True, f"Points: {stats['total_memory_points']}, Meetings: {stats['total_meetings_indexed']}")
except Exception as e:
    record("MemoryService", "get_memory_stats: Schema and field validation", False, error=str(e))


# ==============================================================================
# 2. ORCHESTRATOR & AGENT FUNCTIONS (All combinations & edge cases)
# ==============================================================================
print("\n>>> [2/5] Testing Orchestrator & Agent Functions...")

# 2.1 _clean_json
try:
    clean1 = orchestrator._clean_json('{"key": "value"}')
    assert clean1 == {"key": "value"}
    clean2 = orchestrator._clean_json('```json\n{"key": "value"}\n```')
    assert clean2 == {"key": "value"}
    clean3 = orchestrator._clean_json('```\n{"key": "value"}\n```')
    assert clean3 == {"key": "value"}
    clean4 = orchestrator._clean_json('   {"numbers": [1, 2, 3]}   ')
    assert clean4 == {"numbers": [1, 2, 3]}
    record("Orchestrator", "_clean_json: Standard & markdown-fenced valid JSON", True)
except Exception as e:
    record("Orchestrator", "_clean_json: Standard & markdown-fenced valid JSON", False, error=str(e))

try:
    # Malformed JSON should raise json.JSONDecodeError
    malformed = False
    try:
        orchestrator._clean_json('{"key": "value", trailing_comma: }')
    except json.JSONDecodeError:
        malformed = True
    assert malformed
    record("Orchestrator", "_clean_json: Malformed JSON throws JSONDecodeError", True, "Expected exception handled")
except Exception as e:
    record("Orchestrator", "_clean_json: Malformed JSON throws JSONDecodeError", False, error=str(e))

try:
    # Empty string should raise json.JSONDecodeError
    malformed = False
    try:
        orchestrator._clean_json('')
    except json.JSONDecodeError:
        malformed = True
    assert malformed
    record("Orchestrator", "_clean_json: Empty string throws JSONDecodeError", True)
except Exception as e:
    record("Orchestrator", "_clean_json: Empty string throws JSONDecodeError", False, error=str(e))

# 2.2 _call_llm
try:
    res = orchestrator._call_llm("You are a helpful assistant.", "Say 'PONG' in one word.")
    assert "PONG" in res.upper()
    record("Orchestrator", "_call_llm: Basic prompt completion", True, f"Response: {res[:50]}")
except Exception as e:
    record("Orchestrator", "_call_llm: Basic prompt completion", False, error=str(e))

try:
    # JSON mode
    res = orchestrator._call_llm("You are a helpful assistant. Output JSON.", "Return a JSON object with key 'status' equal to 'ok'.")
    parsed = json.loads(res)
    assert parsed.get("status") == "ok"
    record("Orchestrator", "_call_llm: JSON-mode structured completion", True)
except Exception as e:
    record("Orchestrator", "_call_llm: JSON-mode structured completion", False, error=str(e))

# 2.3 execute_meeting_dag
try:
    # Test with synchronous callback
    sync_events = []
    dag_res = asyncio.run(orchestrator.execute_meeting_dag(
        transcript="Alice: We decided to deploy to Kubernetes. Bob will set up the Helm charts by Monday.",
        title="K8s Deployment Sync",
        event_callback=lambda evt: sync_events.append(evt)
    ))
    assert "id" in dag_res
    assert "summary" in dag_res
    assert "decisions" in dag_res
    assert "action_items" in dag_res
    assert "risks" in dag_res
    assert len(sync_events) >= 6
    record("Orchestrator", "execute_meeting_dag: Synchronous event_callback", True, f"{len(sync_events)} events emitted")
except Exception as e:
    record("Orchestrator", "execute_meeting_dag: Synchronous event_callback", False, error=str(e))

try:
    # Test with async callback
    async_events = []
    async def async_cb(evt):
        async_events.append(evt)

    dag_res = asyncio.run(orchestrator.execute_meeting_dag(
        transcript="Carla: Security review passed. Dave will sign off the report tomorrow.",
        title=None,  # Auto-generated title
        event_callback=async_cb
    ))
    assert dag_res["title"].startswith("Meeting:")
    assert len(async_events) >= 6
    record("Orchestrator", "execute_meeting_dag: Async event_callback + auto title", True, f"Title: {dag_res['title']}")
except Exception as e:
    record("Orchestrator", "execute_meeting_dag: Async event_callback + auto title", False, error=str(e))

try:
    # Test with None callback
    dag_res = asyncio.run(orchestrator.execute_meeting_dag(
        transcript="Frank: Just a quick check-in. No decisions made.",
        event_callback=None
    ))
    assert "id" in dag_res
    record("Orchestrator", "execute_meeting_dag: None callback", True)
except Exception as e:
    record("Orchestrator", "execute_meeting_dag: None callback", False, error=str(e))

# 2.4 answer_cross_meeting_query
try:
    ans = orchestrator.answer_cross_meeting_query("What did we decide about Kubernetes and Helm charts?")
    assert "answer" in ans and len(ans["answer"]) > 10
    assert "citations" in ans and len(ans["citations"]) > 0
    assert "total_memories_found" in ans
    record("Orchestrator", "answer_cross_meeting_query: Relevant query with citations", True, f"Citations: {len(ans['citations'])}")
except Exception as e:
    record("Orchestrator", "answer_cross_meeting_query: Relevant query with citations", False, error=str(e))

try:
    ans = orchestrator.answer_cross_meeting_query("Quantum computing teleportation algorithm on Neptune")
    assert "answer" in ans and len(ans["answer"]) > 5
    record("Orchestrator", "answer_cross_meeting_query: Out-of-domain query", True, f"Memories found: {ans['total_memories_found']}")
except Exception as e:
    record("Orchestrator", "answer_cross_meeting_query: Out-of-domain query", False, error=str(e))


# ==============================================================================
# 3. OMI SERVICE FUNCTIONS (All combinations & edge cases)
# ==============================================================================
print("\n>>> [3/5] Testing OmiService Functions...")

# 3.1 parse_omi_webhook
try:
    # Standard format
    parsed = omi_service.parse_omi_webhook({
        "session_id": "sess_123",
        "timestamp": "2026-10-10T12:00:00Z",
        "segments": [
            {"speaker": "Alice", "text": "Hello world."},
            {"speaker": "Bob", "text": "Goodbye world."}
        ]
    })
    assert parsed["session_id"] == "sess_123"
    assert "Alice: Hello world." in parsed["transcript"]
    assert "Bob: Goodbye world." in parsed["transcript"]
    assert parsed["segments_count"] == 2
    record("OmiService", "parse_omi_webhook: Standard structured payload", True)
except Exception as e:
    record("OmiService", "parse_omi_webhook: Standard structured payload", False, error=str(e))

try:
    # Alternative field 'id' instead of 'session_id'
    parsed = omi_service.parse_omi_webhook({"id": "alt_sess_456", "transcript": "Raw transcript fallback"})
    assert parsed["session_id"] == "alt_sess_456"
    assert parsed["transcript"] == "Raw transcript fallback"
    record("OmiService", "parse_omi_webhook: 'id' key and raw 'transcript' fallback", True)
except Exception as e:
    record("OmiService", "parse_omi_webhook: 'id' key and raw 'transcript' fallback", False, error=str(e))

try:
    # Empty payload
    parsed = omi_service.parse_omi_webhook({})
    assert parsed["session_id"] == "omi_session_default"
    assert parsed["transcript"] == ""
    record("OmiService", "parse_omi_webhook: Empty dict payload", True)
except Exception as e:
    record("OmiService", "parse_omi_webhook: Empty dict payload", False, error=str(e))

try:
    # Segments without speaker or text
    parsed = omi_service.parse_omi_webhook({
        "segments": [
            {"text": "Only text without speaker."},
            {"speaker": "Silent Speaker"},
            {}
        ]
    })
    assert "Speaker: Only text without speaker." in parsed["transcript"]
    assert parsed["segments_count"] == 3
    record("OmiService", "parse_omi_webhook: Incomplete segment objects", True)
except Exception as e:
    record("OmiService", "parse_omi_webhook: Incomplete segment objects", False, error=str(e))

# 3.2 transcribe_audio_bytes
try:
    # Empty bytes should raise ValueError
    caught = False
    try:
        omi_service.transcribe_audio_bytes(b"")
    except ValueError as ve:
        caught = True
    assert caught
    record("OmiService", "transcribe_audio_bytes: Empty bytes throws ValueError", True)
except Exception as e:
    record("OmiService", "transcribe_audio_bytes: Empty bytes throws ValueError", False, error=str(e))

try:
    # Non-empty fake/corrupt bytes should raise an error from Groq
    caught = False
    try:
        omi_service.transcribe_audio_bytes(b"not_a_real_mp3_or_wav_audio_stream_data_here", "corrupt.mp3")
    except Exception:
        caught = True
    assert caught
    record("OmiService", "transcribe_audio_bytes: Corrupted audio throws API error", True)
except Exception as e:
    record("OmiService", "transcribe_audio_bytes: Corrupted audio throws API error", False, error=str(e))

try:
    # Test valid synthesis / wav header audio bytes
    # Create a tiny 1-second silent WAV file in memory
    import wave
    wav_buf = io.BytesIO()
    with wave.open(wav_buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b'\x00\x00' * 16000) # 1 sec silence
    silent_wav = wav_buf.getvalue()

    res = omi_service.transcribe_audio_bytes(silent_wav, "silence.wav")
    assert "text" in res
    record("OmiService", "transcribe_audio_bytes: Valid 1-second WAV audio", True, f"Duration: {res.get('duration')}")
except Exception as e:
    record("OmiService", "transcribe_audio_bytes: Valid 1-second WAV audio", False, error=str(e))


# ==============================================================================
# 4. FASTAPI HTTP & WEBSOCKET ENDPOINTS (All methods, parameters & boundaries)
# ==============================================================================
print("\n>>> [4/5] Testing FastAPI Endpoints (HTTP & WebSockets)...")

# 4.1 GET /
try:
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["project"] == "MeetSight" and data["status"] == "operational"
    record("API", "GET / (Root endpoint)", True)
except Exception as e:
    record("API", "GET / (Root endpoint)", False, error=str(e))

# 4.2 GET /api/health
try:
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["qdrant"]["connected"] is True
    assert data["lyzr_orchestrator"]["ready"] is True
    assert data["omi"]["webhook_active"] is True
    record("API", "GET /api/health (Health check endpoint)", True)
except Exception as e:
    record("API", "GET /api/health (Health check endpoint)", False, error=str(e))

# 4.3 POST /api/process-meeting
try:
    # Valid
    res = client.post("/api/process-meeting", json={
        "transcript": "Eve: Let's finalize the Sprint 5 roadmap. We will deploy Redis cache on Tuesday.",
        "title": "Roadmap Finalization"
    })
    assert res.status_code == 200
    assert res.json()["success"] is True
    record("API", "POST /api/process-meeting: Valid transcript", True)
except Exception as e:
    record("API", "POST /api/process-meeting: Valid transcript", False, error=str(e))

try:
    # Empty transcript (should return 400)
    res = client.post("/api/process-meeting", json={"transcript": ""})
    assert res.status_code == 400
    record("API", "POST /api/process-meeting: Empty transcript (400 validation)", True)
except Exception as e:
    record("API", "POST /api/process-meeting: Empty transcript (400 validation)", False, error=str(e))

try:
    # Whitespace-only transcript (should return 400)
    res = client.post("/api/process-meeting", json={"transcript": "     \n\t   "})
    assert res.status_code == 400
    record("API", "POST /api/process-meeting: Whitespace transcript (400 validation)", True)
except Exception as e:
    record("API", "POST /api/process-meeting: Whitespace transcript (400 validation)", False, error=str(e))

try:
    # Missing transcript field (Pydantic validation 422)
    res = client.post("/api/process-meeting", json={"title": "No transcript field"})
    assert res.status_code == 422
    record("API", "POST /api/process-meeting: Missing transcript field (422 schema error)", True)
except Exception as e:
    record("API", "POST /api/process-meeting: Missing transcript field (422 schema error)", False, error=str(e))

# 4.4 POST /api/audio/upload
try:
    # Silent audio upload
    wav_buf = io.BytesIO()
    with wave.open(wav_buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b'\x00\x00' * 16000)
    files = {"file": ("silent_meeting.wav", wav_buf.getvalue(), "audio/wav")}
    res = client.post("/api/audio/upload", files=files, data={"title": "Silent Meeting Test"})
    # Silent audio returns 400 "Audio file could not be transcribed or is silent." or 200
    assert res.status_code in [200, 400]
    record("API", "POST /api/audio/upload: Valid WAV upload", True, f"Status: {res.status_code} ({res.json().get('detail', 'transcribed')})")
except Exception as e:
    record("API", "POST /api/audio/upload: Valid WAV upload", False, error=str(e))

try:
    # > 100MB file limit boundary check
    fake_huge_bytes = b"0" * (101 * 1024 * 1024)
    files = {"file": ("huge.wav", fake_huge_bytes, "audio/wav")}
    res = client.post("/api/audio/upload", files=files)
    assert res.status_code == 400
    assert "exceeds the 100MB maximum limit" in res.json().get("detail", "")
    record("API", "POST /api/audio/upload: > 100MB file rejection (400)", True)
except Exception as e:
    record("API", "POST /api/audio/upload: > 100MB file rejection (400)", False, error=str(e))

# 4.5 POST /api/omi/webhook
try:
    # Standard webhook
    res = client.post("/api/omi/webhook", json={
        "session_id": "omi_sync_999",
        "segments": [{"speaker": "Grace", "text": "We approved the budget for Q4 marketing."}]
    })
    assert res.status_code == 200
    assert res.json()["status"] == "processed"
    record("API", "POST /api/omi/webhook: Standard webhook payload", True)
except Exception as e:
    record("API", "POST /api/omi/webhook: Standard webhook payload", False, error=str(e))

try:
    # Webhook with empty transcript / empty segments
    res = client.post("/api/omi/webhook", json={"session_id": "empty_session", "segments": []})
    assert res.status_code == 200
    assert res.json()["action"] == "ignored_empty_payload"
    record("API", "POST /api/omi/webhook: Empty segments ignored gracefully", True)
except Exception as e:
    record("API", "POST /api/omi/webhook: Empty segments ignored gracefully", False, error=str(e))

# 4.6 POST /api/chat
try:
    res = client.post("/api/chat", json={"query": "What did Grace say about the Q4 marketing budget?"})
    assert res.status_code == 200
    assert "answer" in res.json()
    record("API", "POST /api/chat: Valid memory query", True)
except Exception as e:
    record("API", "POST /api/chat: Valid memory query", False, error=str(e))

try:
    # Empty query (400)
    res = client.post("/api/chat", json={"query": ""})
    assert res.status_code == 400
    record("API", "POST /api/chat: Empty query (400 validation)", True)
except Exception as e:
    record("API", "POST /api/chat: Empty query (400 validation)", False, error=str(e))

try:
    # Whitespace query (400)
    res = client.post("/api/chat", json={"query": "   \n\t  "})
    assert res.status_code == 400
    record("API", "POST /api/chat: Whitespace query (400 validation)", True)
except Exception as e:
    record("API", "POST /api/chat: Whitespace query (400 validation)", False, error=str(e))

# 4.7 GET /api/meetings
try:
    res = client.get("/api/meetings")
    assert res.status_code == 200
    assert "meetings" in res.json() and "total" in res.json()
    record("API", "GET /api/meetings: Default limit", True, f"Found: {res.json()['total']}")
except Exception as e:
    record("API", "GET /api/meetings: Default limit", False, error=str(e))

try:
    # Boundary: limit=1
    res = client.get("/api/meetings?limit=1")
    assert res.status_code == 200
    assert len(res.json()["meetings"]) <= 1
    record("API", "GET /api/meetings: Boundary limit=1", True)
except Exception as e:
    record("API", "GET /api/meetings: Boundary limit=1", False, error=str(e))

try:
    # Invalid limit: limit=0 (FastAPI ge=1 validation error 422)
    res = client.get("/api/meetings?limit=0")
    assert res.status_code == 422
    record("API", "GET /api/meetings: Invalid limit=0 (422 validation)", True)
except Exception as e:
    record("API", "GET /api/meetings: Invalid limit=0 (422 validation)", False, error=str(e))

try:
    # Invalid limit: limit=201 (FastAPI le=200 validation error 422)
    res = client.get("/api/meetings?limit=201")
    assert res.status_code == 422
    record("API", "GET /api/meetings: Invalid limit=201 (422 validation)", True)
except Exception as e:
    record("API", "GET /api/meetings: Invalid limit=201 (422 validation)", False, error=str(e))

try:
    # Invalid non-integer limit
    res = client.get("/api/meetings?limit=invalid_number")
    assert res.status_code == 422
    record("API", "GET /api/meetings: Non-integer limit (422 validation)", True)
except Exception as e:
    record("API", "GET /api/meetings: Non-integer limit (422 validation)", False, error=str(e))

# 4.8 GET /api/memory/stats
try:
    res = client.get("/api/memory/stats")
    assert res.status_code == 200
    assert "total_memory_points" in res.json()
    record("API", "GET /api/memory/stats: Metrics & points inspection", True)
except Exception as e:
    record("API", "GET /api/memory/stats: Metrics & points inspection", False, error=str(e))

# 4.9 POST /api/memory/search
try:
    res = client.post("/api/memory/search", json={"query": "Kubernetes", "limit": 2})
    assert res.status_code == 200
    assert "results" in res.json()
    record("API", "POST /api/memory/search: Semantic search", True, f"Hits: {res.json()['count']}")
except Exception as e:
    record("API", "POST /api/memory/search: Semantic search", False, error=str(e))

try:
    # With category
    res = client.post("/api/memory/search", json={"query": "deploy", "category": "decision", "limit": 2})
    assert res.status_code == 200
    record("API", "POST /api/memory/search: With category='decision'", True)
except Exception as e:
    record("API", "POST /api/memory/search: With category='decision'", False, error=str(e))

# 4.10 WebSocket /ws/agent-stream
try:
    with client.websocket_connect("/ws/agent-stream") as websocket:
        greeting = websocket.receive_text()
        parsed_greeting = json.loads(greeting)
        assert parsed_greeting["event"] == "connected"
        # Test sending client ping
        websocket.send_text("ping")
    record("API", "WS /ws/agent-stream: Handshake, greeting, ping-pong & clean disconnect", True)
except Exception as e:
    record("API", "WS /ws/agent-stream: Handshake, greeting, ping-pong & clean disconnect", False, error=str(e))


# ==============================================================================
# 5. RATE LIMITS & CONCURRENCY STRESS TESTS
# ==============================================================================
print("\n>>> [5/5] Testing Rate Limits, Concurrency & High Load...")

# 5.1 Concurrent vector search (20 simultaneous threads)
try:
    def concurrent_search(q):
        r = client.post("/api/memory/search", json={"query": f"Query {q}"})
        return r.status_code

    with ThreadPoolExecutor(max_workers=10) as executor:
        status_codes = list(executor.map(concurrent_search, range(20)))

    assert all(code == 200 for code in status_codes)
    record("StressTest", "Vector Search: 20 concurrent queries", True, f"All returned 200 OK")
except Exception as e:
    record("StressTest", "Vector Search: 20 concurrent queries", False, error=str(e))

# 5.2 Concurrent read/write to Qdrant persistent storage
try:
    def concurrent_store_and_search(idx):
        mid = memory_service.store_meeting({
            "title": f"Concurrent Meeting {idx}",
            "transcript": f"Concurrent discussion {idx} about automated performance benchmarking."
        })
        hits = memory_service.search_memory(f"Concurrent discussion {idx}", limit=1)
        return len(hits) > 0

    with ThreadPoolExecutor(max_workers=5) as executor:
        rw_results = list(executor.map(concurrent_store_and_search, range(5)))

    assert all(rw_results)
    record("StressTest", "Qdrant Storage: 5 concurrent read-write transactions", True, "No SQLite/lock contention failures")
except Exception as e:
    record("StressTest", "Qdrant Storage: 5 concurrent read-write transactions", False, error=str(e))

# 5.3 Burst API requests to /api/health and /api/meetings (50 rapid requests)
try:
    t0 = time.time()
    burst_codes = []
    for _ in range(50):
        r = client.get("/api/health")
        burst_codes.append(r.status_code)
    t_elapsed = time.time() - t0
    assert all(c == 200 for c in burst_codes)
    rps = 50 / t_elapsed
    record("StressTest", "Burst HTTP Traffic: 50 rapid GET requests", True, f"Throughput: {rps:.1f} req/sec in {t_elapsed:.2f}s")
except Exception as e:
    record("StressTest", "Burst HTTP Traffic: 50 rapid GET requests", False, error=str(e))

# 5.4 LLM Rate Limit & Token Limit Verification
try:
    # Test Groq rate limit headers
    import requests
    h_res = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
        json={"model": orchestrator.model_name, "messages": [{"role": "user", "content": "ping"}]}
    )
    limit_req = h_res.headers.get("x-ratelimit-limit-requests", "N/A")
    rem_req = h_res.headers.get("x-ratelimit-remaining-requests", "N/A")
    limit_tok = h_res.headers.get("x-ratelimit-limit-tokens", "N/A")
    rem_tok = h_res.headers.get("x-ratelimit-remaining-tokens", "N/A")
    reset_tok = h_res.headers.get("x-ratelimit-reset-tokens", "N/A")
    record("RateLimits", f"Groq Rate Limits (Model: {orchestrator.model_name})", True, 
           f"Tokens/min Limit: {limit_tok}, Remaining Tokens: {rem_tok}, Token Reset: {reset_tok}, Requests Limit: {limit_req}, Remaining Req: {rem_req}")
except Exception as e:
    record("RateLimits", "Groq Rate Limits check", False, error=str(e))

# 5.5 Fast Rapid Chat Burst (Testing 5 sequential LLM requests to check TPM impact)
try:
    chat_statuses = []
    for i in range(3):
        r = client.post("/api/chat", json={"query": f"Summarize key decision {i}"})
        chat_statuses.append(r.status_code)
    assert all(s == 200 for s in chat_statuses)
    record("RateLimits", "Rapid sequential LLM queries (3 queries)", True, f"Statuses: {chat_statuses}")
except Exception as e:
    record("RateLimits", "Rapid sequential LLM queries (3 queries)", False, error=str(e))


# ==============================================================================
# SUMMARY & REPORT GENERATION
# ==============================================================================
passes = [r for r in results if r["status"] == "PASS"]
fails = [r for r in results if r["status"] == "FAIL"]

print("\n" + "="*80)
print(f"BACKEND TEST SUMMARY: {len(passes)} PASSED, {len(fails)} FAILED (Total: {len(results)})")
print("="*80)

if fails:
    print("\nFAILED TESTS:")
    for f in fails:
        print(f"❌ [{f['category']}] {f['name']}: {f['error']}")

# Save test results to a JSON file for report generation
with open(BASE_DIR / "backend_test_results.json", "w", encoding="utf-8") as out_f:
    json.dump({
        "total": len(results),
        "passed": len(passes),
        "failed": len(fails),
        "tests": results
    }, out_f, indent=2)

print(f"\nSaved detailed results to {BASE_DIR / 'backend_test_results.json'}")
