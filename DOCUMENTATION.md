# Milan.AI (MeetAI) — Project Documentation

## 1) Project Overview
**Milan.AI** (package name: `meetai`) is a Next.js (App Router) web application that acts as an **AI meeting assistant**. It lets users create “agents” (AI personas/instructions), schedule and run video meetings using Stream Video, automatically capture transcripts/recordings, and then **summarize meetings asynchronously**. After a meeting is completed, users can **chat** with the assistant about the meeting using Stream Chat + OpenAI responses grounded in the stored summary.

## 2) Problem Statement
Meetings generate a lot of information (decisions, action items, context) that is difficult to capture and revisit. Milan.AI aims to:
- **Automate capture** (recording + transcription)
- **Automate synthesis** (structured summary)
- **Enable retrieval** (chat Q&A about the meeting later)
- **Make it customizable** via “agents” with different instructions
- **Support monetization** with usage limits and upgrades

## 3) Features
- **Authentication**
  - Email/password auth
  - Social login via **GitHub** and **Google**
  - Session storage in Postgres via Drizzle adapter (Better Auth)
- **Agents (AI personas)**
  - Create, update, delete, search, paginate agents
  - Each agent has custom `instructions` used during meetings
- **Meetings**
  - Create meetings linked to an agent
  - Meeting lifecycle statuses: `upcoming → active → processing → completed` (or `cancelled`)
  - Store transcript URL, recording URL, summary, timestamps
- **Video calling (Stream Video)**
  - Create Stream calls with automatic transcription + recording enabled
  - Server-generated Stream user tokens for client join
  - Webhook handler reacts to meeting/call events
- **Asynchronous processing (Inngest)**
  - On transcription ready, enqueue an async job to parse transcript and generate a summary
  - Persist summary and mark meeting `completed`
- **Post-meeting chat (Stream Chat + OpenAI)**
  - Create chat tokens for users
  - When a user messages in a completed meeting’s channel, the webhook uses OpenAI to respond
  - Responses are instructed to rely on the saved meeting summary
- **Premium / Monetization (Polar)**
  - Polar integration via Better Auth plugin
  - Usage limits enforced for free users (max free agents/meetings)
  - Upgrade flow and customer portal support
- **API layer**
  - **tRPC** used for typed API procedures for agents/meetings/premium
  - Next.js API routes expose `/api/trpc`, `/api/auth/*`, `/api/inngest`, `/api/webhook`

## 4) Tech Stack
- **Framework**: Next.js `15.3.x` (App Router), React `19`
- **Language**: TypeScript `5`
- **UI**: Tailwind CSS `v4`, shadcn/ui (Radix UI primitives), lucide icons
- **Data fetching**: TanStack React Query + tRPC (`@trpc/*`, `@tanstack/*`)
- **Database**: Postgres (Neon serverless) + Drizzle ORM + Drizzle Kit
- **Auth**: Better Auth (`better-auth`) + Drizzle adapter
- **Payments/Subscriptions**: Polar (`@polar-sh/sdk`, `@polar-sh/better-auth`)
- **Video + Transcription + Recording**: Stream Video (`@stream-io/*`)
- **Chat**: Stream Chat (`stream-chat`, `stream-chat-react`)
- **AI**: OpenAI (`openai`) and Inngest Agent Kit (`@inngest/agent-kit`)
- **Background jobs**: Inngest (`inngest`, `inngest/next`)

## 5) Installation Steps
### Prerequisites
- Node.js (recommended: Node 20+)
- A Postgres database (commonly Neon)
- Accounts/keys for:
  - Stream Video + Stream Chat
  - OpenAI
  - Polar (sandbox by default in this repo)
  - OAuth apps for GitHub + Google (optional if using email/password only)

### Install dependencies
From the nested project folder:

```bash
npm install
```

### Configure environment variables
This repo does not include an `.env.example`, so create a `.env.local` in the project root with at least:

```bash
# Database
DATABASE_URL="postgres://..."

# App URL (used by tRPC on the server to build absolute URL)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth OAuth providers (optional if you only use email/password)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stream (Video + Chat)
NEXT_PUBLIC_STREAM_VIDEO_API_KEY="..."
STREAM_VIDEO_SECRET_KEY="..."
NEXT_PUBLIC_STREAM_CHAT_API_KEY="..."
STREAM_CHAT_API_SECRET="..."

# Payments (Polar)
POLAR_ACCESS_TOKEN="..."

# AI
OPENAI_API_KEY="..."
```

### Set up the database schema (Drizzle)
Push the schema to Postgres:

```bash
npm run db:push
```

Optional: open Drizzle Studio:

```bash
npm run db:studio
```

### Run the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Webhooks (Stream Video + Stream Chat events)
The app expects Stream webhooks to hit:
- `POST /api/webhook`

During local development you’ll typically use a tunnel (ngrok). This repo contains a convenience script:
- `npm run dev:webhook` (uses a hardcoded ngrok URL in `package.json`; you will likely need to change it to your own)

In Stream’s dashboard, configure the webhook URL to your tunnel + `/api/webhook`, and ensure your Stream signing secret is set via `STREAM_VIDEO_SECRET_KEY` (used for verifying signatures).

### Background jobs (Inngest)
The app serves Inngest at:
- `/api/inngest`

You’ll need to run/configure Inngest depending on your environment (local dev vs hosted). The code registers the `meetings/processing` function which summarizes transcripts.

## 6) Project Structure
Top-level layout:

```text
MILAN-AI-Version_2.0-main/
  public/                  # Static assets
  src/
    app/                   # Next.js App Router routes + API routes
    components/            # Shared UI components (shadcn/ui + app components)
    db/                    # Drizzle DB client + schema
    hooks/                 # Shared React hooks
    inngest/               # Inngest client + functions
    lib/                   # Auth, Stream SDK clients, Polar client, utilities
    modules/               # Feature modules (agents, meetings, call, premium, auth, dashboard)
    trpc/                  # tRPC router + client/server glue
    constants.ts           # Shared constants
    drizzle.config.ts      # Drizzle Kit config
  package.json
  next.config.ts
  tsconfig.json
```

Key routes:
- **UI pages**
  - `/` dashboard/home (requires session)
  - `/agents`, `/agents/[agentId]`
  - `/meetings`, `/meetings/[meetingId]`
  - `/call/[meetingId]`
  - `/sign-in`, `/sign-up`
  - `/upgrade`
- **API**
  - `/api/auth/*` Better Auth Next.js handler
  - `/api/trpc` tRPC endpoint
  - `/api/webhook` Stream events → meeting state updates + chat responses
  - `/api/inngest` Inngest serve endpoint

## 7) How it Works
### Core data model
Drizzle schema (`src/db/schema.ts`) defines:
- **Auth tables**: `user`, `session`, `account`, `verification`
- **App tables**:
  - `agents`: user-owned AI agents with `instructions`
  - `meetings`: user-owned meetings linked to an `agentId`, with status, transcript/recording URLs, and `summary`

### Request/flow overview
- **Auth**
  - UI pages call Better Auth via `auth` (`src/lib/auth.ts`) and route handler (`src/app/api/auth/[...alll]/route.ts`).
- **tRPC**
  - UI uses `@tanstack/react-query` + tRPC to fetch/mutate data.
  - Routers: `agents`, `meetings`, `premium` (`src/trpc/routers/_app.ts`).
  - Protected procedures require a valid session (`protectedProcedure` in `src/trpc/init.ts`).
- **Meeting creation**
  - `meetings.create` inserts a meeting in Postgres.
  - It also creates a Stream Video call with recording + transcription set to auto-on.
  - The selected agent is upserted as a Stream user (so it can participate).
- **Joining a call**
  - Client requests a Stream Video token via `meetings.generateToken`.
  - Client uses `StreamVideoClient` to connect and join the call (`src/modules/call/ui/components/call-connect.tsx`).
- **Webhook-driven meeting lifecycle**
  - Stream events hit `POST /api/webhook`.
  - Examples:
    - `call.session_started` → mark meeting `active` and connect OpenAI realtime to the call using the agent instructions.
    - `call.session_ended` → mark meeting `processing`.
    - `call.transcription_ready` → store `transcriptURL` and enqueue background processing.
    - `call.recording_ready` → store `recordingURL`.
- **Async summarization**
  - Inngest function `meetings/processing`:
    - Fetch transcript JSONL
    - Map speaker IDs to user/agent names
    - Generate a structured markdown summary via Inngest Agent Kit + OpenAI
    - Save `summary` and set meeting status to `completed`
- **Post-meeting chat**
  - Client generates Stream Chat token via `meetings.generateChatToken`.
  - When a new message arrives (`message.new`) for a **completed** meeting channel, the webhook:
    - Builds a system prompt containing the stored `summary` and the agent’s original instructions
    - Calls OpenAI chat completions
    - Sends the response back into the Stream Chat channel as the agent user

### Premium enforcement
- `premiumProcedure("agents" | "meetings")` checks Polar customer state and counts the user’s current agents/meetings.
- Free users are limited by constants in `src/modules/premium/constants.ts` (referenced in `src/trpc/init.ts`).

## 8) Future Improvements
- **Config hygiene**
  - Add `.env.example` and document webhook/inngest setup more explicitly.
  - Make `npm run dev:webhook` configurable (avoid hardcoded ngrok domain).
- **Security & correctness**
  - Verify webhook API key usage (currently header `x-api-key` is read but not validated).
  - Tighten tRPC context (there’s a placeholder `userId: "user_123"` in `createTRPCContext` even though auth is used elsewhere).
- **Reliability**
  - Add retries/backoff and failure states for transcript fetch/summarization.
  - Store transcript content (or an extracted, normalized version) instead of only a URL.
- **Product**
  - Action items extraction, attendees list, searchable summaries.
  - Better meeting analytics (duration, talk time, key topics).
  - Team/workspace support and shared meetings.
- **Testing**
  - Add integration tests for tRPC procedures and webhook handlers.
  - Add E2E flows for sign-in → create agent → create meeting → end call → summary appears.

## 9) Conclusion
Milan.AI is a full-stack meeting assistant built on Next.js with a modern typed API (tRPC), Postgres persistence (Drizzle/Neon), real-time meeting infrastructure (Stream Video/Chat), asynchronous summarization (Inngest), and subscription gating (Polar). Its core value is turning meeting audio into structured knowledge that users can reliably revisit and query after the fact.

