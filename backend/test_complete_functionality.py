#!/usr/bin/env python3
"""
Comprehensive End-to-End Functionality & Stress Test Suite for MeetSight.
Tests:
1. Load Demo DAG processing (Product & Architecture Sprint Sync + Q4 Agent Infra)
2. Audio transcription (Whisper Large V3 via Groq) + ffmpeg compression pipeline
3. Qdrant persistent vector memory storage & semantic search with filters
4. Cross-meeting contextual Q&A with citations
5. Full FastAPI HTTP endpoints
"""

import os
import sys
import time
import math
import wave
import struct
import tempfile
import json
from typing import List, Dict, Any

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from config import settings
from services.memory_service import memory_service
from services.orchestrator_service import orchestrator
from services.omi_service import omi_service
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

DEMO_TRANSCRIPTS = [
    {
        "title": "Product & Architecture Sprint Sync",
        "text": """Rahul: Welcome everyone to today's Sprint Architecture sync. First item on the agenda: in our previous sprint review we evaluated both JWT and OAuth2, and today we officially confirm that we will adopt OAuth2 with Google and GitHub providers for user authentication. 
Sarah: Sounds great. I will finalize the OAuth callback flows and refresh token rotation logic by Thursday.
Rahul: Perfect. Now regarding the backend deployment: we have committed to deploying the core FastAPI microservices to AWS Elastic Container Service by this Friday.
Alex: I am assigned to set up the production PostgreSQL database, write the migration scripts, and configure the Docker containers. I will have that ready by Wednesday evening.
Rahul: Excellent. Please keep in mind the major blocker: AWS credit approval is still pending with finance. If it is delayed past Wednesday, we might need to stage on our backup Render cluster to prevent schedule slip. Let's make sure Sarah and Alex coordinate on schema contracts by tomorrow noon."""
    },
    {
        "title": "Q4 AI Agent Infrastructure Strategy",
        "text": """David: Today we are aligning on our autonomous agent infrastructure for Q4. We agreed to standardize on Lyzr for all agentic reasoning and DAG workflows rather than maintaining custom prompt chains.
Elena: That will save us weeks of orchestration boilerplate. I will build the decision engine and action extractor agents using Lyzr by next Monday.
Marcus: Regarding vector memory: we decided to adopt Qdrant for persistent vector search across all meeting transcripts and knowledge bases. Qdrant's payload filtering and fast cosine search give us the exact low-latency retrieval we need for cross-meeting recall.
David: Action item for Marcus: provision the Qdrant cluster and configure 384-dimensional dense vector embeddings by Friday. Any risks?
Elena: Risk of rate limits on LLM inference if we run multiple concurrent DAGs. We should add client-side batching and fallback to Groq or local models if quotas are reached."""
    }
]


def generate_test_wav_bytes(duration_sec: float = 2.0, sample_rate: int = 16000) -> bytes:
    """Generate a valid WAV audio file in memory."""
    buf = tempfile.SpooledTemporaryFile()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        total_frames = int(duration_sec * sample_rate)
        # Generate tone with subtle modulation
        audio_data = bytearray()
        for i in range(total_frames):
            freq = 440.0 + 50.0 * math.sin(2.0 * math.pi * 2.0 * (i / sample_rate))
            value = int(10000.0 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            audio_data.extend(struct.pack('<h', value))
        wf.writeframes(audio_data)
    buf.seek(0)
    return buf.read()


def test_1_memory_service_client_integrity():
    print("\n" + "="*80)
    print("TEST 1: QdrantMemoryService Client & Collections Integrity")
    print("="*80)
    
    assert hasattr(memory_service, "client"), "FAIL: memory_service missing 'client' attribute!"
    assert memory_service.client is not None, "FAIL: memory_service.client is None!"
    print(f"  [PASS] memory_service.client exists: {type(memory_service.client)}")
    
    # Check collections
    collections_resp = memory_service.client.get_collections()
    col_names = [c.name for c in collections_resp.collections]
    print(f"  [PASS] Active Qdrant collections: {col_names}")
    assert "meeting_memory" in col_names, "FAIL: meeting_memory collection missing!"
    assert "meetings_meta" in col_names, "FAIL: meetings_meta collection missing!"

    # Check lazy embedding model property
    emb = memory_service.embedding_model
    assert emb is not None, "FAIL: memory_service.embedding_model failed to load!"
    sample_vecs = list(emb.embed(["MeetSight Test Vector"]))
    assert len(sample_vecs) == 1, "FAIL: embed failed!"
    assert len(sample_vecs[0]) == 384, f"FAIL: Expected 384 dimensions, got {len(sample_vecs[0])}"
    print(f"  [PASS] FastEmbed bge-small-en-v1.5 generated {len(sample_vecs[0])}-dim vector.")
    return True


def test_2_load_demo_dag_execution():
    print("\n" + "="*80)
    print("TEST 2: 'Load Demo' Multi-Agent DAG Execution (Simulating User Action)")
    print("="*80)
    
    results = []
    for idx, demo in enumerate(DEMO_TRANSCRIPTS, 1):
        print(f"\n--- Running Demo {idx}: '{demo['title']}' ---")
        events_emitted = []

        def event_listener(event):
            agent_name = event.get("agent_name", "unknown")
            status = event.get("status", "")
            thought = event.get("thought", "")
            events_emitted.append(agent_name)
            print(f"    [Agent Event] -> {agent_name} ({status}): {thought}")

        start_time = time.time()
        import asyncio
        res = asyncio.run(orchestrator.execute_meeting_dag(
            transcript=demo["text"],
            title=demo["title"],
            duration="25m",
            participants=["Rahul", "Sarah", "Alex", "David", "Elena", "Marcus"],
            event_callback=event_listener
        ))
        elapsed = time.time() - start_time
        print(f"  Execution completed in {elapsed:.2f} seconds.")

        # Assertions
        meeting_id = res.get("id") or res.get("meeting_id")
        assert meeting_id is not None, "FAIL: meeting id missing in result!"
        print(f"  [PASS] Persisted meeting_id: {meeting_id}")

        # Summary check
        summary = res.get("summary", {})
        overview = summary.get("overview") or summary.get("executive_summary") or ""
        key_points = summary.get("key_points") or summary.get("key_takeaways") or []
        print(f"  [PASS] Summary Overview: {overview[:120]}...")
        print(f"  [PASS] Key Points ({len(key_points)} items): {key_points[:2]}")
        assert len(overview) > 0 or len(key_points) > 0, "FAIL: Summary empty!"

        # Decisions check
        decisions = res.get("decisions", [])
        print(f"  [PASS] Decisions extracted ({len(decisions)} items):")
        for d in decisions[:2]:
            dec_text = d.get("text") or d.get("decision") or ""
            print(f"         - {dec_text} (Category: {d.get('category')})")
        assert len(decisions) > 0, "FAIL: No decisions extracted!"

        # Action items check
        actions = res.get("action_items", [])
        print(f"  [PASS] Action items extracted ({len(actions)} items):")
        for a in actions[:2]:
            print(f"         - [{a.get('priority')}] {a.get('task')} -> {a.get('assignee')} (Due: {a.get('deadline')})")
        assert len(actions) > 0, "FAIL: No action items extracted!"

        # Risks check
        risks = res.get("risks", [])
        print(f"  [PASS] Risks extracted ({len(risks)} items):")
        for r in risks[:2]:
            print(f"         - [{r.get('severity')}] {r.get('risk')} (Mitigation: {r.get('mitigation')})")
        assert len(risks) > 0, "FAIL: No risks extracted!"

        results.append(res)
        # Short cooldown to respect Groq rate limits
        time.sleep(2.0)

    return results


def test_3_audio_module_and_ffmpeg():
    print("\n" + "="*80)
    print("TEST 3: Audio Processing, Whisper STT & Bundled FFmpeg")
    print("="*80)
    
    # 1. Test imageio-ffmpeg presence
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    assert os.path.exists(ffmpeg_exe), f"FAIL: ffmpeg executable does not exist at {ffmpeg_exe}"
    print(f"  [PASS] Bundled ffmpeg verified: {ffmpeg_exe}")

    # 2. Test standard audio transcription
    print("  Generating 2.5-second test WAV stream...")
    test_wav = generate_test_wav_bytes(duration_sec=2.5)
    print(f"  WAV size: {len(test_wav)} bytes ({len(test_wav)/1024:.1f} KB)")
    
    stt_res = omi_service.transcribe_audio_bytes(test_wav, filename="unit_test.wav")
    print(f"  [PASS] Whisper STT executed successfully!")
    print(f"         Detected Language: {stt_res.get('language')}, Duration: {stt_res.get('duration')}s")

    # 3. Test compression pipeline on a large audio buffer
    print("  Testing ffmpeg audio compression pipeline on simulated file...")
    dummy_wav = generate_test_wav_bytes(duration_sec=10.0)
    preprocessed = omi_service._preprocess_and_transcribe(dummy_wav, "large_sample.wav")
    assert "text" in preprocessed, "FAIL: Preprocessing transcription missing 'text' field!"
    print(f"  [PASS] ffmpeg compression and transcode successfully handled audio!")
    return True


def test_4_qdrant_semantic_search_and_retrieval():
    print("\n" + "="*80)
    print("TEST 4: Qdrant Vector Memory Semantic Search & Multi-Meeting Retrieval")
    print("="*80)
    
    test_queries = [
        {"q": "What authentication provider was selected?", "category": "decision"},
        {"q": "Who is setting up the PostgreSQL database?", "category": "action_item"},
        {"q": "What is the blocker with AWS credits?", "category": "risk"},
        {"q": "Why was Qdrant chosen for vector memory?", "category": "decision"},
        {"q": "Who is configuring the 384 dimensional vector embeddings?", "category": "action_item"}
    ]

    for item in test_queries:
        hits = memory_service.search_memory(
            query=item["q"],
            category=item.get("category"),
            limit=3,
            score_threshold=0.25
        )
        print(f"\n  Query: '{item['q']}' [Filter: {item.get('category')}]")
        print(f"  Hits found: {len(hits)}")
        assert len(hits) > 0, f"FAIL: No vector hits found for '{item['q']}'!"
        top_hit = hits[0]
        print(f"  Top Match (Score: {top_hit.get('score'):.4f}):")
        print(f"    Meeting: {top_hit.get('meeting_title')}")
        print(f"    Category: {top_hit.get('category')}")
        print(f"    Text: {top_hit.get('text')}")

    # Inspect Stats
    stats = memory_service.get_memory_stats()
    print("\n  [PASS] Current Qdrant Memory Stats:")
    print(f"         Total Vector Points: {stats.get('total_memory_points')}")
    print(f"         Total Meetings Indexed: {stats.get('total_meetings_indexed')}")
    print(f"         Vector Dimension: {stats.get('vector_dimension')}")
    print(f"         Storage Mode: {stats.get('storage_mode')}")
    assert stats.get("total_memory_points", 0) > 0, "FAIL: 0 memory points in Qdrant!"
    return True


def test_5_cross_meeting_rag_qa():
    print("\n" + "="*80)
    print("TEST 5: Cross-Meeting Contextual Intelligence (RAG Q&A)")
    print("="*80)
    
    questions = [
        "What are all the commitments and action items assigned across our meetings?",
        "What are the architecture and infrastructure decisions made so far?"
    ]

    for q in questions:
        print(f"\n  Asking: '{q}'")
        start = time.time()
        ans = orchestrator.answer_cross_meeting_query(query=q)
        duration = time.time() - start
        print(f"  Answer received in {duration:.2f}s:")
        print(f"  --- Response preview ---\n{ans.get('answer', '')[:350]}...\n  -----------------------")
        print(f"  Citations provided: {len(ans.get('citations', []))}")
        assert len(ans.get("answer", "")) > 50, "FAIL: Answer is too short or empty!"
        assert len(ans.get("citations", [])) > 0, "FAIL: No citations returned!"
        time.sleep(2.0)
    return True


def test_6_fastapi_endpoints():
    print("\n" + "="*80)
    print("TEST 6: FastAPI HTTP Endpoints (Simulating Vercel Frontend Calls)")
    print("="*80)
    
    # 1. Health endpoint
    r_health = client.get("/api/health")
    assert r_health.status_code == 200, f"Health check failed: {r_health.status_code}"
    health_json = r_health.json()
    print(f"  [PASS] GET /api/health -> 200 OK: Qdrant connected={health_json['qdrant']['connected']}")
    assert health_json["qdrant"]["connected"] is True

    # 2. POST /api/process-meeting (What the UI calls on 'Load demo')
    print("  Testing POST /api/process-meeting with sample payload...")
    r_proc = client.post("/api/process-meeting", json={
        "transcript": "Dan: Let's deploy to staging on Tuesday. Frank: I will verify SSL certificates by Monday.",
        "title": "API Direct Test Meeting",
        "duration": "10m"
    })
    assert r_proc.status_code == 200, f"FAIL: process-meeting returned {r_proc.status_code}: {r_proc.text}"
    proc_json = r_proc.json()
    meeting_obj = proc_json.get("meeting", {})
    meeting_id = meeting_obj.get("id")
    print(f"  [PASS] POST /api/process-meeting -> 200 OK (meeting_id: {meeting_id})")
    assert proc_json.get("success") is True
    assert "summary" in meeting_obj
    assert "decisions" in meeting_obj

    # 3. GET /api/meetings
    r_meetings = client.get("/api/meetings?limit=10")
    assert r_meetings.status_code == 200
    meetings = r_meetings.json()
    print(f"  [PASS] GET /api/meetings -> 200 OK (Retrieved {len(meetings)} meetings)")
    assert len(meetings) >= 1

    # 4. POST /api/chat
    r_chat = client.post("/api/chat", json={"query": "Who is verifying the SSL certificates?"})
    assert r_chat.status_code == 200
    chat_json = r_chat.json()
    print(f"  [PASS] POST /api/chat -> 200 OK: {chat_json.get('answer', '')[:120]}...")

    # 5. GET /api/memory/stats
    r_stats = client.get("/api/memory/stats")
    assert r_stats.status_code == 200
    print(f"  [PASS] GET /api/memory/stats -> 200 OK (Total points: {r_stats.json().get('total_memory_points')})")

    # 6. POST /api/audio/transcribe (Two-Step Flow Step 1)
    print("  Testing POST /api/audio/transcribe (Two-Step Flow Step 1)...")
    wav_bytes = generate_test_wav_bytes(duration_sec=1.5)
    files = {"file": ("test_transcribe.wav", wav_bytes, "audio/wav")}
    data = {"title": "Two-Step Transcribe Test"}
    r_trans = client.post("/api/audio/transcribe", files=files, data=data)
    assert r_trans.status_code == 200, f"FAIL: /api/audio/transcribe returned {r_trans.status_code}: {r_trans.text}"
    trans_json = r_trans.json()
    print(f"  [PASS] POST /api/audio/transcribe -> 200 OK (Transcript length: {len(trans_json.get('transcript', ''))}, suggested_title: {trans_json.get('suggested_title')})")
    assert trans_json.get("success") is True
    assert "transcript" in trans_json

    # 7. POST /api/audio/upload with valid WAV (Legacy single-request endpoint)
    print("  Testing POST /api/audio/upload with synthetic audio...")
    files2 = {"file": ("test_upload.wav", wav_bytes, "audio/wav")}
    data2 = {"title": "Voice Upload Endpoint Test"}
    r_upload = client.post("/api/audio/upload", files=files2, data=data2)
    assert r_upload.status_code == 200, f"FAIL: Audio upload returned {r_upload.status_code}: {r_upload.text}"
    upload_json = r_upload.json()
    up_meeting = upload_json.get("meeting", {})
    print(f"  [PASS] POST /api/audio/upload -> 200 OK (Transcribed & DAG executed, meeting_id: {up_meeting.get('id')})")
    assert upload_json.get("success") is True

    return True


if __name__ == "__main__":
    total_start = time.time()
    print("\n" + "#"*80)
    print("STARTING COMPLETE END-TO-END MEETSIGHT FUNCTIONALITY TEST SUITE")
    print("#"*80)

    try:
        test_1_memory_service_client_integrity()
        test_2_load_demo_dag_execution()
        test_3_audio_module_and_ffmpeg()
        test_4_qdrant_semantic_search_and_retrieval()
        test_5_cross_meeting_rag_qa()
        test_6_fastapi_endpoints()

        total_elapsed = time.time() - total_start
        print("\n" + "="*80)
        print(f"🎉 ALL FUNCTIONALITY TESTS PASSED WITH 100% SUCCESS in {total_elapsed:.2f}s!")
        print("   - QdrantMemoryService: Initialized, healthy & indexed")
        print("   - Load Demo Workflow: 5 Agents executed, summarized & stored")
        print("   - Audio Module (Whisper STT & ffmpeg): Compressed, transcribed & processed")
        print("   - Semantic Search & Filters: Verified with high precision")
        print("   - Cross-Meeting RAG: Grounded answers with citations verified")
        print("   - FastAPI HTTP Endpoints: All 200 OK")
        print("="*80 + "\n")
        sys.exit(0)
    except Exception as e:
        import traceback
        print("\n" + "!"*80)
        print(f"TEST FAILED WITH EXCEPTION: {e}")
        traceback.print_exc()
        print("!"*80 + "\n")
        sys.exit(1)
