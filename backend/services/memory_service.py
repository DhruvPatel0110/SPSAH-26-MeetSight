import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from qdrant_client import QdrantClient
from qdrant_client.http import models
from fastembed import TextEmbedding

from config import settings

class QdrantMemoryService:
    def __init__(self):
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.vector_dim = 384  # bge-small-en-v1.5 dimension
        self.collection_name = "meeting_memory"
        self.meetings_collection = "meetings_meta"
        
        # Initialize client
        if settings.QDRANT_URL == "local" or not settings.QDRANT_URL.startswith("http"):
            os.makedirs(settings.QDRANT_STORAGE_PATH, exist_ok=True)
            try:
                self.client = QdrantClient(path=settings.QDRANT_STORAGE_PATH)
                print(f"[Qdrant] Connected to local persistent storage at: {settings.QDRANT_STORAGE_PATH}")
            except Exception as e:
                print(f"[Qdrant] Lock warning on {settings.QDRANT_STORAGE_PATH} ({e}), falling back to in-memory store.")
                self.client = QdrantClient(location=":memory:")
        else:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
            )
            print(f"[Qdrant] Connected to Qdrant Cloud cluster: {settings.QDRANT_URL}")
            
        self._ensure_collections()

    def _ensure_collections(self):
        """Ensure required collections exist in Qdrant with appropriate index schemas."""
        try:
            collections = [col.name for col in self.client.get_collections().collections]
            
            # Vector memory collection
            if self.collection_name not in collections:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_dim,
                        distance=models.Distance.COSINE
                    )
                )
                print(f"[Qdrant] Created collection: {self.collection_name}")
                
            # Meetings metadata collection (dummy vector of size 1 for key-value store, or standard payload)
            if self.meetings_collection not in collections:
                self.client.create_collection(
                    collection_name=self.meetings_collection,
                    vectors_config=models.VectorParams(
                        size=self.vector_dim,
                        distance=models.Distance.COSINE
                    )
                )
                print(f"[Qdrant] Created collection: {self.meetings_collection}")
                
        except Exception as e:
            print(f"[Qdrant] Error initializing collections: {e}")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate dense vector embeddings using FastEmbed."""
        if not texts:
            return []
        embeddings = list(self.embedding_model.embed(texts))
        return [emb.tolist() for emb in embeddings]

    def store_meeting(self, meeting_data: Dict[str, Any]) -> str:
        """
        Store full meeting metadata, transcript chunks, decisions, and action items in Qdrant.
        """
        meeting_id = meeting_data.get("id") or str(uuid.uuid4())
        title = meeting_data.get("title", f"Meeting - {datetime.now().strftime('%b %d, %Y')}")
        date_str = meeting_data.get("date", datetime.now().isoformat())
        summary = meeting_data.get("summary", {})
        transcript = meeting_data.get("transcript", "")
        decisions = meeting_data.get("decisions", [])
        action_items = meeting_data.get("action_items", [])
        risks = meeting_data.get("risks", [])

        # 1. Embed and store the overall meeting summary
        summary_text = summary.get("overview", "") if isinstance(summary, dict) else str(summary)
        if not summary_text and transcript:
            summary_text = transcript[:500]
            
        summary_emb = self.embed_texts([f"{title}. {summary_text}"])[0]
        
        # Save to meetings_meta
        self.client.upsert(
            collection_name=self.meetings_collection,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"meta_{meeting_id}")),
                    vector=summary_emb,
                    payload={
                        "meeting_id": meeting_id,
                        "title": title,
                        "date": date_str,
                        "duration": meeting_data.get("duration", "N/A"),
                        "participants": meeting_data.get("participants", []),
                        "summary": summary,
                        "decisions": decisions,
                        "action_items": action_items,
                        "risks": risks,
                        "raw_transcript_preview": transcript[:1000] if transcript else ""
                    }
                )
            ]
        )

        points_to_insert = []
        texts_to_embed = []
        point_payloads = []

        # 2. Index transcript in 3-sentence chunks
        if transcript:
            sentences = [s.strip() for s in transcript.replace("\n", " ").split(".") if len(s.strip()) > 15]
            chunk_size = 3
            for i in range(0, len(sentences), chunk_size):
                chunk = ". ".join(sentences[i:i + chunk_size]) + "."
                texts_to_embed.append(chunk)
                point_payloads.append({
                    "meeting_id": meeting_id,
                    "meeting_title": title,
                    "date": date_str,
                    "category": "transcript_chunk",
                    "text": chunk,
                    "chunk_index": i // chunk_size
                })

        # 3. Index decisions
        for decision in decisions:
            dec_text = decision if isinstance(decision, str) else decision.get("text", "")
            if dec_text:
                texts_to_embed.append(f"Decision: {dec_text}")
                point_payloads.append({
                    "meeting_id": meeting_id,
                    "meeting_title": title,
                    "date": date_str,
                    "category": "decision",
                    "text": dec_text,
                    "status": decision.get("status", "approved") if isinstance(decision, dict) else "approved"
                })

        # 4. Index action items
        for action in action_items:
            action_text = action if isinstance(action, str) else action.get("task", "")
            if action_text:
                assignee = action.get("assignee", "Team") if isinstance(action, dict) else "Team"
                texts_to_embed.append(f"Action item for {assignee}: {action_text}")
                point_payloads.append({
                    "meeting_id": meeting_id,
                    "meeting_title": title,
                    "date": date_str,
                    "category": "action_item",
                    "text": action_text,
                    "assignee": assignee,
                    "priority": action.get("priority", "medium") if isinstance(action, dict) else "medium",
                    "deadline": action.get("deadline", "Next sync") if isinstance(action, dict) else "Next sync"
                })

        # 5. Index risks / blockers
        for risk in risks:
            risk_text = risk if isinstance(risk, str) else risk.get("description", "")
            if risk_text:
                texts_to_embed.append(f"Risk or blocker: {risk_text}")
                point_payloads.append({
                    "meeting_id": meeting_id,
                    "meeting_title": title,
                    "date": date_str,
                    "category": "risk",
                    "text": risk_text
                })

        # Batch embed and write to Qdrant
        if texts_to_embed:
            vectors = self.embed_texts(texts_to_embed)
            for idx, (vec, payload) in enumerate(zip(vectors, point_payloads)):
                point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{meeting_id}_{payload['category']}_{idx}"))
                points_to_insert.append(
                    models.PointStruct(
                        id=point_id,
                        vector=vec,
                        payload=payload
                    )
                )

            self.client.upsert(
                collection_name=self.collection_name,
                points=points_to_insert
            )
            print(f"[Qdrant] Successfully stored {len(points_to_insert)} memory points for meeting '{title}'")

        return meeting_id

    def search_memory(self, query: str, category: Optional[str] = None, limit: int = 5, score_threshold: float = 0.3) -> List[Dict[str, Any]]:
        """
        Semantic vector search across historical meetings stored in Qdrant.
        """
        query_embedding = self.embed_texts([query])[0]
        
        query_filter = None
        if category:
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="category",
                        match=models.MatchValue(value=category)
                    )
                ]
            )

        search_results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding,
            query_filter=query_filter,
            limit=limit,
            score_threshold=score_threshold
        )

        results = []
        for hit in search_results.points:
            results.append({
                "id": str(hit.id),
                "score": round(float(hit.score), 4),
                "meeting_id": hit.payload.get("meeting_id"),
                "meeting_title": hit.payload.get("meeting_title"),
                "date": hit.payload.get("date"),
                "category": hit.payload.get("category"),
                "text": hit.payload.get("text"),
                "payload": hit.payload
            })

        return results

    def get_all_meetings(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve all stored meeting summaries from meetings_meta."""
        try:
            scroll_result = self.client.scroll(
                collection_name=self.meetings_collection,
                limit=limit,
                with_payload=True,
                with_vectors=False
            )
            meetings = []
            for point in scroll_result[0]:
                payload = point.payload or {}
                meetings.append({
                    "id": payload.get("meeting_id", str(point.id)),
                    "title": payload.get("title", "Untitled Meeting"),
                    "date": payload.get("date"),
                    "duration": payload.get("duration", "N/A"),
                    "participants": payload.get("participants", []),
                    "summary": payload.get("summary", {}),
                    "decisions": payload.get("decisions", []),
                    "action_items": payload.get("action_items", []),
                    "risks": payload.get("risks", []),
                    "preview": payload.get("raw_transcript_preview", "")
                })
            # Sort newest first
            meetings.sort(key=lambda m: m.get("date", ""), reverse=True)
            return meetings
        except Exception as e:
            print(f"[Qdrant] Error fetching meetings: {e}")
            return []

    def get_memory_stats(self) -> Dict[str, Any]:
        """Return collection info and recent vector points for the UI Memory Explorer."""
        try:
            info_memory = self.client.get_collection(self.collection_name)
            info_meta = self.client.get_collection(self.meetings_collection)
            
            # Fetch recent 20 memory points to display in inspector
            scroll_res = self.client.scroll(
                collection_name=self.collection_name,
                limit=20,
                with_payload=True,
                with_vectors=False
            )
            
            sample_points = []
            for p in scroll_res[0]:
                sample_points.append({
                    "id": str(p.id),
                    "category": p.payload.get("category", "chunk"),
                    "meeting_title": p.payload.get("meeting_title", "Unknown"),
                    "date": p.payload.get("date"),
                    "text": p.payload.get("text", "")[:120] + "..." if len(p.payload.get("text", "")) > 120 else p.payload.get("text", ""),
                    "full_payload": p.payload
                })

            return {
                "collection": self.collection_name,
                "total_memory_points": info_memory.points_count,
                "total_meetings_indexed": info_meta.points_count,
                "vector_dimension": self.vector_dim,
                "distance_metric": "Cosine",
                "storage_mode": "Local Disk Persistent" if settings.QDRANT_URL == "local" else "Qdrant Cloud",
                "recent_points": sample_points
            }
        except Exception as e:
            return {
                "error": str(e),
                "total_memory_points": 0,
                "total_meetings_indexed": 0,
                "recent_points": []
            }

# Singleton instance
memory_service = QdrantMemoryService()
