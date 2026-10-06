import json
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from services.memory_service import memory_service
from services.orchestrator_service import orchestrator
from services.omi_service import omi_service

app = FastAPI(
    title="MeetSight AI - Multi-Agent Meeting Intelligence",
    description="Autonomous Voice-First Meeting Intelligence powered by Omi, Lyzr, and Qdrant (SPSAH-26)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during development & hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections for agent observability stream
active_websockets: List[WebSocket] = []

async def broadcast_agent_event(event: Dict[str, Any]):
    """Broadcast real-time agent execution events to all connected clients."""
    if not active_websockets:
        return
    disconnected = []
    message = json.dumps(event)
    for ws in active_websockets:
        try:
            await ws.send_text(message)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        if ws in active_websockets:
            active_websockets.remove(ws)


# Request Models
class ProcessMeetingRequest(BaseModel):
    transcript: str
    title: Optional[str] = None
    duration: Optional[str] = "N/A"
    participants: Optional[List[str]] = []

class ChatQueryRequest(BaseModel):
    query: str

class MemorySearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    limit: Optional[int] = 5


@app.get("/")
def root():
    return {
        "project": "MeetSight",
        "description": "Autonomous Voice-First Agentic Meeting Intelligence",
        "hackathon": "Stop Prompting: Code Solo Agents Hackathon 2026",
        "stack": {
            "voice": "Omi Ambient Capture / Groq Whisper",
            "orchestrator": "Lyzr Multi-Agent DAG (5 Specialized Agents)",
            "memory": "Qdrant Persistent Vector Database (bge-small-en-v1.5)"
        },
        "status": "operational"
    }


@app.get("/api/health")
def health_check():
    stats = memory_service.get_memory_stats()
    return {
        "status": "healthy",
        "qdrant": {
            "connected": True,
            "mode": stats.get("storage_mode"),
            "memory_points": stats.get("total_memory_points", 0),
            "meetings_indexed": stats.get("total_meetings_indexed", 0)
        },
        "lyzr_orchestrator": {
            "ready": bool(settings.GROQ_API_KEY or settings.LYZR_API_KEY),
            "model": orchestrator.model_name,
            "agents": ["Summarizer", "Decision Engine", "Action Tracker", "Risk Analyzer", "Memory Indexer", "Contextual Q&A"]
        },
        "omi": {
            "webhook_active": True,
            "stt_engine": "Groq Whisper Large V3"
        }
    }


@app.post("/api/process-meeting")
async def process_meeting(request: ProcessMeetingRequest):
    """
    Execute the Lyzr Multi-Agent DAG on a meeting transcript and persist knowledge in Qdrant.
    """
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        meeting_record = await orchestrator.execute_meeting_dag(
            transcript=request.transcript,
            title=request.title,
            event_callback=broadcast_agent_event
        )
        return {"success": True, "meeting": meeting_record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/upload")
async def upload_audio(file: UploadFile = File(...), title: Optional[str] = Form(None)):
    """
    Transcribe audio recording via Whisper and automatically trigger the Lyzr agent DAG.
    """
    try:
        audio_bytes = await file.read()
        transcription_result = omi_service.transcribe_audio_bytes(audio_bytes, filename=file.filename)
        transcript = transcription_result.get("text", "")
        
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Audio file could not be transcribed or is silent.")

        meeting_title = title if title else f"Meeting: {file.filename.rsplit('.', 1)[0]}"
        
        meeting_record = await orchestrator.execute_meeting_dag(
            transcript=transcript,
            title=meeting_title,
            event_callback=broadcast_agent_event
        )
        
        meeting_record["duration"] = f"{int(transcription_result.get('duration') or 0)}s"
        meeting_record["language"] = transcription_result.get("language")
        
        return {
            "success": True,
            "transcription": transcription_result,
            "meeting": meeting_record
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/omi/webhook")
async def omi_webhook(payload: Dict[str, Any], x_omi_secret: Optional[str] = Header(None)):
    """
    Receive ambient voice transcription stream from physical Omi device or companion app.
    """
    parsed = omi_service.parse_omi_webhook(payload)
    transcript = parsed.get("transcript", "")
    
    if not transcript:
        return {"status": "received", "action": "ignored_empty_payload"}

    # Trigger agentic analysis asynchronously
    meeting_title = f"Omi Ambient Capture - {parsed.get('session_id')[:8]}"
    meeting_record = await orchestrator.execute_meeting_dag(
        transcript=transcript,
        title=meeting_title,
        event_callback=broadcast_agent_event
    )

    return {
        "status": "processed",
        "source": "omi",
        "session_id": parsed.get("session_id"),
        "meeting_id": meeting_record.get("id")
    }


@app.post("/api/chat")
async def chat_memory_query(request: ChatQueryRequest):
    """
    Contextual Q&A Agent: Query Qdrant vector memory across past and present meetings.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response = orchestrator.answer_cross_meeting_query(query=request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/meetings")
def get_meetings(limit: int = Query(50, ge=1, le=200)):
    """Retrieve all historical meetings indexed in Qdrant."""
    meetings = memory_service.get_all_meetings(limit=limit)
    return {"meetings": meetings, "total": len(meetings)}


@app.get("/api/memory/stats")
def get_memory_stats():
    """Retrieve vector database metrics and sample points for the Qdrant Memory Explorer UI."""
    return memory_service.get_memory_stats()


@app.post("/api/memory/search")
def search_memory(request: MemorySearchRequest):
    """Direct semantic similarity search on Qdrant vector memory."""
    results = memory_service.search_memory(
        query=request.query,
        category=request.category,
        limit=request.limit or 5
    )
    return {"query": request.query, "results": results, "count": len(results)}


@app.websocket("/ws/agent-stream")
async def agent_stream(websocket: WebSocket):
    """
    Real-time WebSocket endpoint streaming Lyzr agent execution steps, thoughts, and DAG status.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        # Send initial connection greeting
        await websocket.send_text(json.dumps({
            "event": "connected",
            "message": "Connected to MeetSight Lyzr Observable Agent Stream",
            "timestamp": "now"
        }))
        while True:
            # Keep connection open and receive optional ping/messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
    except Exception:
        if websocket in active_websockets:
            active_websockets.remove(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
