import os
import io
import shutil
import tempfile
import subprocess
import logging
from typing import Dict, Any, Optional, List
from groq import Groq
from config import settings

logger = logging.getLogger(__name__)

# Groq Whisper single-request audio size limit is 25 MB
GROQ_MAX_FILE_BYTES = 24 * 1024 * 1024  # 24MB threshold for safety


class OmiService:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY, max_retries=0) if settings.GROQ_API_KEY else None

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
        Handles audio files up to 100MB by automatically compressing (16kHz mono)
        and chunking when required to comply with Groq's 25MB API limit.
        """
        if not self.groq_client:
            raise ValueError("GROQ_API_KEY is not configured in backend/.env")

        if not audio_bytes:
            raise ValueError("Received empty audio file.")

        file_size = len(audio_bytes)

        # For files under 24MB, try direct transcription first for minimal latency
        if file_size <= GROQ_MAX_FILE_BYTES:
            try:
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
            except Exception as direct_err:
                err_str = str(direct_err).lower()
                # If direct submission failed due to size or format, fall back to ffmpeg preprocessing
                if ("413" in err_str or "too large" in err_str or "entity" in err_str) and shutil.which("ffmpeg"):
                    logger.info("Direct transcription returned 413, falling back to ffmpeg audio processing.")
                    return self._preprocess_and_transcribe(audio_bytes, filename)
                raise direct_err

        # File is > 24MB (e.g. 33MB to 100MB) -> compress & chunk via ffmpeg
        return self._preprocess_and_transcribe(audio_bytes, filename)

    def _preprocess_and_transcribe(self, audio_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Compresses audio to 16kHz mono 48kbps MP3 (reducing size by 4x-10x),
        and chunks into 10-minute segments if it still exceeds 24MB.
        """
        ffmpeg_bin = shutil.which("ffmpeg")
        if not ffmpeg_bin:
            filesize_mb = len(audio_bytes) / (1024 * 1024)
            raise ValueError(
                f"Audio file ({filesize_mb:.1f} MB) exceeds Groq's 25 MB single-file limit. "
                f"ffmpeg is required on the system PATH to automatically process larger files up to 100 MB."
            )

        temp_dir = tempfile.mkdtemp(prefix="meetsight_audio_")
        try:
            # 1. Write uploaded bytes to disk
            ext = os.path.splitext(filename)[1] or ".mp3"
            in_path = os.path.join(temp_dir, f"input{ext}")
            with open(in_path, "wb") as f:
                f.write(audio_bytes)

            # 2. Compress audio to speech-optimized 16kHz mono 48kbps MP3
            comp_path = os.path.join(temp_dir, "optimized_audio.mp3")
            cmd = [
                ffmpeg_bin, "-y", "-i", in_path,
                "-vn", "-ar", "16000", "-ac", "1", "-b:a", "48k",
                comp_path
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True)
            if proc.returncode != 0 or not os.path.exists(comp_path):
                logger.error(f"ffmpeg compression failed: {proc.stderr}")
                raise RuntimeError("Failed to transcode audio file for transcription.")

            comp_size = os.path.getsize(comp_path)
            logger.info(f"Compressed audio from {len(audio_bytes)/(1024*1024):.1f}MB to {comp_size/(1024*1024):.1f}MB")

            # 3. If compressed file fits in Groq's 25MB limit, transcribe directly
            if comp_size <= GROQ_MAX_FILE_BYTES:
                with open(comp_path, "rb") as f:
                    transcription = self.groq_client.audio.transcriptions.create(
                        file=(os.path.basename(comp_path), f),
                        model="whisper-large-v3",
                        response_format="verbose_json"
                    )
                return {
                    "text": transcription.text,
                    "duration": getattr(transcription, "duration", None),
                    "language": getattr(transcription, "language", "en"),
                    "segments": getattr(transcription, "segments", [])
                }

            # 4. If compressed audio is STILL > 24MB (e.g. 2-3+ hour meeting), split into 10-minute segments
            chunks_dir = os.path.join(temp_dir, "chunks")
            os.makedirs(chunks_dir, exist_ok=True)
            chunk_pattern = os.path.join(chunks_dir, "chunk_%03d.mp3")

            chunk_cmd = [
                ffmpeg_bin, "-y", "-i", comp_path,
                "-f", "segment", "-segment_time", "600",
                "-c", "copy", chunk_pattern
            ]
            chunk_proc = subprocess.run(chunk_cmd, capture_output=True, text=True)
            if chunk_proc.returncode != 0:
                raise RuntimeError("Failed to slice large audio file into segments.")

            chunk_files = sorted([
                os.path.join(chunks_dir, f)
                for f in os.listdir(chunks_dir)
                if f.endswith(".mp3")
            ])

            if not chunk_files:
                raise RuntimeError("No audio chunks generated from large file.")

            all_text_parts: List[str] = []
            all_segments: List[Dict[str, Any]] = []
            total_duration = 0.0
            primary_language = "en"
            time_offset = 0.0

            for idx, chunk_file in enumerate(chunk_files):
                with open(chunk_file, "rb") as f:
                    chunk_res = self.groq_client.audio.transcriptions.create(
                        file=(os.path.basename(chunk_file), f),
                        model="whisper-large-v3",
                        response_format="verbose_json"
                    )

                chunk_text = (chunk_res.text or "").strip()
                if chunk_text:
                    all_text_parts.append(chunk_text)

                chunk_dur = getattr(chunk_res, "duration", None)
                if chunk_dur is None or chunk_dur <= 0:
                    chunk_dur = 600.0

                if idx == 0 and hasattr(chunk_res, "language") and chunk_res.language:
                    primary_language = chunk_res.language

                chunk_segs = getattr(chunk_res, "segments", []) or []
                for seg in chunk_segs:
                    if isinstance(seg, dict):
                        shifted_seg = dict(seg)
                        if "start" in shifted_seg and shifted_seg["start"] is not None:
                            shifted_seg["start"] = round(shifted_seg["start"] + time_offset, 2)
                        if "end" in shifted_seg and shifted_seg["end"] is not None:
                            shifted_seg["end"] = round(shifted_seg["end"] + time_offset, 2)
                        all_segments.append(shifted_seg)
                    else:
                        all_segments.append(seg)

                time_offset += chunk_dur
                total_duration += chunk_dur

            return {
                "text": " ".join(all_text_parts),
                "duration": total_duration,
                "language": primary_language,
                "segments": all_segments
            }

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)


# Singleton instance
omi_service = OmiService()
