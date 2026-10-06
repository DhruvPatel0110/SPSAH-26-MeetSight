/**
 * MeetSight API Service
 * Connects frontend to the FastAPI backend (Lyzr Agent DAG, Qdrant Vector Memory, and Omi Voice capture)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/agent-stream';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn('[MeetSight API] Backend not reachable:', error);
    return null;
  }
}

export async function processMeetingTranscript(transcript, title = null) {
  const res = await fetch(`${API_BASE}/process-meeting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to process meeting');
  }
  return await res.json();
}

export async function uploadMeetingAudio(file, title = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);

  const res = await fetch(`${API_BASE}/audio/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Audio upload & transcription failed');
  }
  return await res.json();
}

export async function askCrossMeetingMemory(query) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Query failed');
  }
  return await res.json();
}

export async function getHistoricalMeetings(limit = 50) {
  const res = await fetch(`${API_BASE}/meetings?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch historical meetings');
  return await res.json();
}

export async function getQdrantMemoryStats() {
  const res = await fetch(`${API_BASE}/memory/stats`);
  if (!res.ok) throw new Error('Failed to fetch Qdrant memory stats');
  return await res.json();
}

export async function searchQdrantMemory(query, category = null) {
  const res = await fetch(`${API_BASE}/memory/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, category }),
  });
  if (!res.ok) throw new Error('Failed to search memory');
  return await res.json();
}

export function subscribeToAgentStream(onEvent, onOpen, onClose) {
  let ws = null;
  try {
    ws = new WebSocket(WS_BASE);
    ws.onopen = () => {
      console.log('⚡ Connected to Lyzr Observable Agent Stream');
      if (onOpen) onOpen();
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onEvent) onEvent(data);
      } catch (e) {
        console.error('Failed to parse agent stream message:', e);
      }
    };
    ws.onclose = () => {
      console.log('Lyzr Agent Stream disconnected');
      if (onClose) onClose();
    };
    ws.onerror = (err) => {
      console.warn('Lyzr Agent Stream WebSocket error:', err);
    };
  } catch (err) {
    console.warn('Could not establish WebSocket connection:', err);
  }

  return () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}
