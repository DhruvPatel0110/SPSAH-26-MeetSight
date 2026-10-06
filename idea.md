# MeetIQ --- From Meetings to Insights

## 1. Idea Overview

MeetIQ is an AI-powered meeting intelligence platform that transforms
natural conversations into structured, actionable insights.

For this hackathon, we are **not building MeetIQ from scratch**. MeetIQ
was previously developed as a project for the IBM BOB Hackathon. We are
taking that existing working system and evolving it into an autonomous,
voice-first, multi-agent application using the mandatory hackathon
technologies: **Omi, Lyzr, and Qdrant**.

The core idea is simple:

> **Normal meetings → summarized insights → actionable outcomes**

The upgraded version moves beyond basic transcription and summarization.
It can understand a conversation, identify what matters, remember
relevant information from previous meetings, and help users retrieve or
act on that knowledge.

## 2. Existing MeetIQ Project

The original MeetIQ was built as a full-stack AI meeting analysis
platform.

Its existing capabilities include:

-   Audio-based meeting transcription
-   AI-generated summaries
-   Topic and sentiment analysis
-   Action-item extraction
-   Speaker identification and timestamps
-   RAG-based question answering
-   Semantic search
-   Persistent conversation history
-   User authentication and data isolation
-   Export of meeting information

The original implementation used technologies such as Groq Whisper for
transcription, Gemini for analysis, Firebase for authentication and
storage, and a custom RAG pipeline.

This existing foundation significantly reduces development time for the
hackathon.

## 3. What We Are Changing

Instead of replacing MeetIQ completely, we are **re-architecting its
intelligence layer around the hackathon's required ecosystem**.

### Existing

Audio → Transcription → AI Analysis → Custom RAG → Meeting Insights

### Proposed

Omi Voice Input → Lyzr Orchestrator → Specialized Agents → Qdrant Memory
→ Insights / Actions / Contextual Answers

The existing frontend, authentication, meeting history, exports, and
much of the application infrastructure can be reused where appropriate.

## 4. Role of the Mandatory Technologies

### Omi --- Voice Interface

Omi becomes the primary real-time voice input layer.

Instead of requiring users to manually upload a recording, the system
can capture a live conversation and feed the relevant information into
the agent workflow.

**Omi = ears of the system**

### Lyzr --- Agent Orchestration

Lyzr acts as the reasoning and orchestration layer.

Rather than sending every meeting through one generic AI prompt, Lyzr
coordinates specialized agents based on the conversation.

Possible agents include:

-   **Summarizer Agent** --- creates concise meeting summaries
-   **Decision Agent** --- identifies decisions and conclusions
-   **Action Agent** --- extracts tasks, owners, and deadlines
-   **Insight Agent** --- identifies important issues, risks, and
    unresolved points
-   **Memory Agent** --- determines what information should be retained
-   **Q&A Agent** --- answers questions using current and historical
    meeting context

**Lyzr = brain and coordinator**

### Qdrant --- Persistent Semantic Memory

Qdrant becomes the long-term semantic memory of MeetIQ.

Important meeting information is embedded and stored so that future
conversations can retrieve relevant context.

For example:

> "What did we decide about authentication last week?"

The system can search previous meeting knowledge and return the relevant
decision instead of forcing the user to manually search old transcripts.

**Qdrant = memory**

## 5. The Core Workflow

``` text
Omi Voice Input
       ↓
Lyzr Orchestrator
       ↓
Specialized Agents
       ↓
Qdrant Semantic Memory
       ↓
Summary / Decisions / Actions / Insights / Contextual Q&A
```

## 6. Example

A user is in a meeting and says:

> "We need to finish the backend by Friday. Rahul will handle the API,
> I'll take care of the database, and we decided to use OAuth for
> authentication. What did we decide about authentication in the
> previous meeting?"

MeetIQ processes this conversation and produces:

### Summary

The team discussed backend completion and authentication.

### Decisions

-   OAuth selected for authentication.

### Action Items

-   Rahul --- complete API work by Friday.
-   Meeting owner --- complete database work by Friday.

### Insight

The backend deadline is Friday and two parallel workstreams have been
assigned.

### Contextual Answer

The system retrieves the previous meeting from Qdrant and answers the
authentication question using historical context.

## 7. What Makes the Hackathon Version Different

The original MeetIQ was primarily an AI meeting analysis application.

The hackathon version evolves it into an **autonomous multi-agent
meeting intelligence system**.

The key difference is the shift from:

**"Upload a meeting and get a summary."**

to:

**"Speak naturally, let agents understand the meeting, remember what
matters, and retrieve that knowledge when needed."**

This directly aligns the existing product with the hackathon's focus on
autonomous agents, voice interaction, orchestration, and persistent
vector memory.

## 8. Hackathon Track

### Primary Track: Meeting & Lecture Intelligence

MeetIQ naturally fits the Meeting & Lecture Intelligence track because
it provides:

-   Voice-to-insight processing
-   Automated summarization
-   Action-item extraction
-   Semantic retrieval
-   Historical meeting context
-   Contextual question answering

The multi-agent architecture also allows the project to demonstrate the
Collaborative Multi-Agent Workflow aspects of the hackathon.

## 9. Why Reuse MeetIQ?

Reusing MeetIQ gives us a strong starting point rather than spending the
hackathon building basic application infrastructure.

We already have a foundation for:

-   Meeting analysis
-   AI-generated summaries
-   RAG-based Q&A
-   Authentication
-   Persistent user data
-   Meeting history
-   Frontend experience
-   Export functionality

The hackathon effort can therefore focus on the parts that actually
matter for judging:

-   Omi integration
-   Lyzr agent orchestration
-   Qdrant semantic memory
-   Specialized agent workflows
-   Autonomous reasoning
-   Observable agent execution
-   A polished end-to-end demonstration

## 10. Final Product

The proposed MeetIQ is a voice-first meeting intelligence system that
turns conversations into persistent, actionable knowledge.

### In one line:

> **MeetIQ turns meetings into insights, actions, and memory.**

### Core loop:

**Speak → Understand → Remember → Act**

The project is therefore an evolution of an existing working product
into a more autonomous and agentic system built around **Omi + Lyzr +
Qdrant**.
