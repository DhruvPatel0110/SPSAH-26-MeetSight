import os
import io
from typing import Dict, Any, Optional
from groq import Groq
from config import settings

class OmiService:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

    def parse_omi_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse incoming webhook payload from Omi hardware device / Omi mobile app.
        Standard Omi webhook format provides session ID, transcript segments, and speaker flags.
        """
        session_id = payload.get("session_id") or payload.get("id") or "omi_session_default"
        segments = payload.get("segments") or []
        
        # Combine spoken utterances
        transcript_parts = []
        for seg in segments:
            speaker = seg.get("speaker", "Speaker")
            text = seg.get("text", "")
            if text:
                transcript_parts.append(f"{speaker}: {text}")
                
        full_transcript = "\n".join(transcript_parts) if transcript_parts else payload.get("transcript", "")
        
        return {
            "source": "omi_ambient_capture",
            "session_id": session_id,
            "transcript": full_transcript,
            "timestamp": payload.get("timestamp"),
            "segments_count": len(segments),
            "device_model": payload.get("device", "Omi Device V1")
        }

    def transcribe_audio_bytes(self, audio_bytes: bytes, filename: str = "meeting_audio.mp3") -> Dict[str, Any]:
        """
        Transcribe audio stream or file using Groq Whisper Large V3.
        Fastest transcription engine with multi-language and speaker clarity.
        """
        if not self.groq_client:
            raise ValueError("GROQ_API_KEY is not configured in backend/.env")

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        transcription = self.groq_client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="verbose_json"
        )

        return {
            "text": transcription.text,
            "duration": getattr(transcription, "duration", None),
            "language": getattr(transcription, "language", "en"),
            "segments": getattr(transcription, "segments", [])
        }

# Singleton instance
omi_service = OmiService()
