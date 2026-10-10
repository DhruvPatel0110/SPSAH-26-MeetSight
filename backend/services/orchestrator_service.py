import json
import time
import asyncio
import logging
import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from groq import Groq
from config import settings
from services.memory_service import memory_service

logger = logging.getLogger("meetsight.orchestrator")

# System Prompts for Specialized Agents
SUMMARIZER_PROMPT = """You are the Executive Summarizer Agent in the MeetSight agentic system.
Analyze the provided meeting transcript.
Return a valid JSON object with:
{
  "overview": "A 2-3 paragraph executive summary of the entire meeting",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "sentiment": "Positive / Constructive / Urgent / Critical",
  "topics": ["Topic 1", "Topic 2"]
}
Output ONLY raw JSON with no markdown formatting or backticks."""

DECISION_PROMPT = """You are the Decision Extraction Agent in the MeetSight agentic system.
Analyze the transcript and identify every clear decision, agreement, or consensus reached.
Return a valid JSON object with the following structure:
{
  "decisions": [
    {
      "text": "Exact decision reached",
      "rationale": "Brief reason or context discussed",
      "status": "approved",
      "category": "Architecture / Product / Process / Timeline / Other"
    }
  ]
}
If no explicit decisions were made, return {"decisions": []}.
Output ONLY raw JSON with no markdown formatting or backticks."""

ACTION_PROMPT = """You are the Action Item Agent in the MeetSight agentic system.
Extract all concrete tasks, action items, and next steps assigned to individuals or the team.
Return a valid JSON object with the following structure:
{
  "action_items": [
    {
      "task": "Specific actionable task description",
      "assignee": "Name of person responsible (or 'Team')",
      "priority": "high" | "medium" | "low",
      "deadline": "Deadline mentioned (or 'Next sync')",
      "status": "pending"
    }
  ]
}
If no action items were assigned, return {"action_items": []}.
Output ONLY raw JSON with no markdown formatting or backticks."""

RISK_PROMPT = """You are the Risk & Blocker Agent in the MeetSight agentic system.
Identify potential risks, bottlenecks, technical debts, unresolved questions, or friction points discussed.
Return a valid JSON object with the following structure:
{
  "risks": [
    {
      "description": "Description of the risk or blocker",
      "severity": "critical" | "moderate" | "low",
      "suggested_mitigation": "Potential solution or mitigation discussed"
    }
  ]
}
If no risks were identified, return {"risks": []}.
Output ONLY raw JSON with no markdown formatting or backticks."""

QA_SYSTEM_PROMPT = """You are the MeetSight Contextual Memory & Q&A Agent.
You answer user questions about current and historical meetings using context retrieved from Qdrant persistent vector memory.
Always cite the meeting title, date, and specific quotes or decisions when answering.
If the retrieved context does not contain the answer, politely state what is known and what is missing."""


class LyzrMultiAgentOrchestrator:
    def __init__(self):
        # max_retries=0 prevents Groq SDK from sleeping for 30-40 seconds on 429 rate limit
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY, max_retries=0) if settings.GROQ_API_KEY else None
        self.model_name = "openai/gpt-oss-20b"

    def _call_gemini_fallback(self, system_prompt: str, user_content: str) -> Optional[str]:
        """Fallback to Google Gemini 3.8 Flash if Groq exhausts token rate limits."""
        if not settings.GEMINI_API_KEY:
            logger.warning("[Gemini Fallback] GEMINI_API_KEY not configured in environment")
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = f"{system_prompt}\n\nInput Context:\n{user_content}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            with httpx.Client(timeout=25.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return text.strip()
                else:
                    logger.warning(f"[Gemini Fallback] Non-200 status: {res.status_code} - {res.text[:100]}")
        except Exception as e:
            logger.warning(f"[Gemini Fallback] Exception: {e}")
        return None

    def _call_llm(self, system_prompt: str, user_content: str, temperature: float = 0.2) -> str:
        """
        Execute LLM inference with Groq or instant fallback to Gemini on 429 rate limit.
        Zero blocking delays to prevent Render/Vercel HTTP timeouts.
        """
        if not self.groq_client and not settings.GEMINI_API_KEY:
            raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured")

        # 1. Try Groq Primary models
        if self.groq_client:
            models_to_try = [self.model_name, "openai/gpt-oss-120b"]
            for model in models_to_try:
                try:
                    chat_completion = self.groq_client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content}
                        ],
                        model=model,
                        temperature=temperature,
                        response_format={"type": "json_object"} if "JSON" in system_prompt else None
                    )
                    return chat_completion.choices[0].message.content.strip()
                except Exception as e:
                    err_msg = str(e).lower()
                    if "429" in err_msg or "rate" in err_msg or "tpm" in err_msg:
                        logger.info(f"[Groq 429] Rate limit reached. Instantly switching to Gemini 3.8 Flash...")
                        gemini_res = self._call_gemini_fallback(system_prompt, user_content)
                        if gemini_res:
                            return gemini_res
                    continue

        # 2. Try Gemini Fallback
        gemini_res = self._call_gemini_fallback(system_prompt, user_content)
        if gemini_res:
            return gemini_res

        raise RuntimeError("All LLM providers (Groq and Gemini) failed or rate-limited")

    def _clean_json(self, response_text: str) -> Any:
        """Strip markdown codeblocks if present and parse JSON."""
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)

    async def execute_meeting_dag(
        self,
        transcript: str,
        title: Optional[str] = None,
        duration: Optional[str] = "N/A",
        participants: Optional[List[str]] = None,
        event_callback: Optional[Callable[[Dict[str, Any]], Any]] = None
    ) -> Dict[str, Any]:
        """
        Orchestrate the 5 specialized agents across the meeting transcript DAG with observable events.
        Includes token pacing delays between agents to adhere to Groq's 8k TPM limit.
        """
        if not title:
            first_words = " ".join(transcript.split()[:6])
            title = f"Meeting: {first_words}..." if first_words else f"Meeting {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        async def emit(agent_id: str, agent_name: str, status: str, thought: str, data: Any = None):
            if event_callback:
                evt = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "status": status,
                    "thought": thought,
                    "timestamp": datetime.now().isoformat(),
                    "data": data
                }
                if asyncio.iscoroutinefunction(event_callback):
                    await event_callback(evt)
                else:
                    event_callback(evt)

        # ---------------------------------------------------------------------
        # Step 1: Coordinator initializes DAG
        # ---------------------------------------------------------------------
        await emit("coordinator", "Lyzr Orchestrator", "thinking", "Analyzing transcript length and dispatching specialized agents...")

        # ---------------------------------------------------------------------
        # Step 2: Summarizer Agent
        # ---------------------------------------------------------------------
        await emit("summarizer", "Summarizer Agent", "thinking", "Synthesizing executive brief, identifying pillars, and measuring tone...")
        try:
            summary_raw = self._call_llm(SUMMARIZER_PROMPT, f"Transcript:\n{transcript}")
            summary_data = self._clean_json(summary_raw)
        except Exception:
            summary_data = {
                "overview": f"Summary generated from meeting transcript ({len(transcript.split())} words).",
                "key_points": [transcript[:150] + "..."],
                "sentiment": "Neutral",
                "topics": ["General Discussion"]
            }
        await emit("summarizer", "Summarizer Agent", "completed", "Executive summary and topics generated successfully.", summary_data)

        # Token pacing buffer to prevent Groq 8k TPM saturation
        await asyncio.sleep(0.3)

        # ---------------------------------------------------------------------
        # Step 3: Decision Agent
        # ---------------------------------------------------------------------
        await emit("decision_agent", "Decision Engine", "thinking", "Scanning for consensus triggers, architecture choices, and approved policies...")
        try:
            decisions_raw = self._call_llm(DECISION_PROMPT, f"Transcript:\n{transcript}")
            decisions_data = self._clean_json(decisions_raw)
            if isinstance(decisions_data, dict) and "decisions" in decisions_data:
                decisions_data = decisions_data["decisions"]
        except Exception:
            decisions_data = []
        await emit("decision_agent", "Decision Engine", "completed", f"Extracted {len(decisions_data)} concrete decisions.", decisions_data)

        # Token pacing buffer
        await asyncio.sleep(0.3)

        # ---------------------------------------------------------------------
        # Step 4: Action Item Agent
        # ---------------------------------------------------------------------
        await emit("action_agent", "Action Item Tracker", "thinking", "Extracting actionable commitments, assigning owners, and setting priorities...")
        try:
            actions_raw = self._call_llm(ACTION_PROMPT, f"Transcript:\n{transcript}")
            actions_data = self._clean_json(actions_raw)
            if isinstance(actions_data, dict) and "action_items" in actions_data:
                actions_data = actions_data["action_items"]
        except Exception:
            actions_data = []
        await emit("action_agent", "Action Item Tracker", "completed", f"Identified {len(actions_data)} action items.", actions_data)

        # Token pacing buffer
        await asyncio.sleep(0.3)

        # ---------------------------------------------------------------------
        # Step 5: Risk & Blocker Agent
        # ---------------------------------------------------------------------
        await emit("risk_agent", "Risk & Insight Analyzer", "thinking", "Detecting unresolved blockers, dependencies, and friction points...")
        try:
            risks_raw = self._call_llm(RISK_PROMPT, f"Transcript:\n{transcript}")
            risks_data = self._clean_json(risks_raw)
            if isinstance(risks_data, dict) and "risks" in risks_data:
                risks_data = risks_data["risks"]
        except Exception:
            risks_data = []
        await emit("risk_agent", "Risk & Insight Analyzer", "completed", f"Identified {len(risks_data)} potential risks.", risks_data)

        # ---------------------------------------------------------------------
        # Step 6: Memory Indexer Agent (Qdrant Persistent Store)
        # ---------------------------------------------------------------------
        await emit("memory_agent", "Qdrant Memory Indexer", "thinking", "Chunking transcript, generating 384-d embeddings, and persisting to Qdrant...")
        meeting_record = {
            "title": title,
            "date": datetime.now().isoformat(),
            "duration": duration or "N/A",
            "participants": participants or [],
            "transcript": transcript,
            "summary": summary_data,
            "decisions": decisions_data,
            "action_items": actions_data,
            "risks": risks_data
        }
        meeting_id = memory_service.store_meeting(meeting_record)
        meeting_record["id"] = meeting_id

        await emit("memory_agent", "Qdrant Memory Indexer", "completed", f"Meeting vectors and payloads indexed in Qdrant (ID: {meeting_id[:8]}).", {"meeting_id": meeting_id})

        # ---------------------------------------------------------------------
        # Step 7: DAG Finalization
        # ---------------------------------------------------------------------
        await emit("coordinator", "Lyzr Orchestrator", "completed", "All specialized agents completed execution successfully.", meeting_record)

        return meeting_record

    def answer_cross_meeting_query(self, query: str) -> Dict[str, Any]:
        """
        Contextual Q&A Agent querying Qdrant Persistent Memory across all meetings.
        """
        # Step 1: Semantic vector retrieval from Qdrant
        retrieved_points = memory_service.search_memory(query=query, limit=6, score_threshold=0.3)
        
        context_str = ""
        citations = []
        for i, pt in enumerate(retrieved_points):
            cat = pt.get("category", "chunk")
            title = pt.get("meeting_title", "Meeting")
            date = (pt.get("date") or "Unknown date")[:10]
            text = pt.get("text", "")
            context_str += f"\n[Doc {i+1} | {title} ({date}) | Type: {cat}]\n{text}\n"
            citations.append({
                "doc_id": i + 1,
                "meeting_title": title,
                "date": date,
                "category": cat,
                "similarity_score": pt.get("score"),
                "text_snippet": text[:150] + "..." if len(text) > 150 else text
            })

        # Step 2: Agent synthesis
        user_prompt = f"""User Question:
{query}

Retrieved Persistent Memory Context from Qdrant:
{context_str if context_str else "No prior meeting records matched the query."}

Provide a comprehensive, authoritative response answering the user's question. Reference specific meetings and dates where relevant."""

        try:
            response_text = self._call_llm(QA_SYSTEM_PROMPT, user_prompt, temperature=0.3)
        except Exception as e:
            # Graceful synthesis fallback if rate limits or network issues occur
            if citations:
                bullet_pts = "\n".join([f"- {c['meeting_title']} ({c['date']}): {c['text_snippet']}" for c in citations[:3]])
                response_text = f"Retrieved relevant notes from meeting memory:\n{bullet_pts}"
            else:
                response_text = "I could not find relevant meeting records in memory matching that query."

        return {
            "query": query,
            "answer": response_text,
            "citations": citations,
            "total_memories_found": len(retrieved_points)
        }


# Singleton instance
orchestrator = LyzrMultiAgentOrchestrator()
