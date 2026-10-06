import sys
import asyncio
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from services.orchestrator_service import orchestrator

async def main():
    test_transcript = (
        "Rahul: In our previous sprint we decided on OAuth. Today we confirm that we will deploy the "
        "backend to AWS by Friday. Alex is responsible for setting up the PostgreSQL database and Docker "
        "containers by Wednesday. The major risk is AWS credit approval delay, which could push testing to Thursday."
    )
    
    print("\n>>> STARTING LYZR MULTI-AGENT DAG EXECUTION <<<\n")
    
    def on_event(evt):
        print(f"[{evt['agent_name']}] -> {evt['status'].upper()}: {evt['thought']}")
        
    result = await orchestrator.execute_meeting_dag(
        transcript=test_transcript,
        title="Sprint Architecture Sync",
        event_callback=on_event
    )
    
    print("\n>>> DAG EXECUTION COMPLETED <<<")
    print(f"Meeting ID: {result['id']}")
    print(f"Overview: {result['summary'].get('overview')[:100]}...")
    print(f"Decisions ({len(result['decisions'])}): {result['decisions']}")
    print(f"Action Items ({len(result['action_items'])}): {result['action_items']}")
    print(f"Risks ({len(result['risks'])}): {result['risks']}")

    print("\n>>> TESTING CONTEXTUAL Q&A AGENT (QDRANT MEMORY RECALL) <<<")
    qa_res = orchestrator.answer_cross_meeting_query("What did we decide about deploying the backend, and who is handling the database?")
    print(f"\nQ&A Answer:\n{qa_res['answer']}")
    print(f"\nCitations found in Qdrant: {len(qa_res['citations'])}")

if __name__ == "__main__":
    asyncio.run(main())
