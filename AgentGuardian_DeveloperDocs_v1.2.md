# Agent Guardian Developer Docs v1.2

Updated for the current codebase in `/home/sc/AgentGurdian`  
April 2026

## 1. Overview

Agent Guardian is a full-stack TypeScript monorepo that adds a trust and approval layer between an AI agent and user-connected services. The system receives an action request, classifies it into one of three tiers, and then either executes immediately, waits for user approval, or requires MFA-backed confirmation.

The implemented tiers are:

- `AUTO`: execute immediately
- `NUDGE`: wait for user approval within a 60-second window
- `STEP_UP`: require MFA-aware confirmation before execution

The current repo contains three main runtime surfaces:

- `apps/web`: React dashboard
- `apps/api`: Express API and orchestration layer
- `agent`: CLI agent that talks to the API

For day-to-day local setup and CLI usage, use [README.md](/home/sc/AgentGurdian/README.md) as the primary onboarding document. This developer doc is intended to stay implementation-focused.

## 2. Monorepo Layout

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   └── src
│   └── web
│       └── src
├── agent
│   └── src
├── packages
│   └── shared
└── docs
```

Key files:

- `apps/api/src/app.ts`: Express app and route mounting
- `apps/api/src/routes/*.ts`: public API surface
- `apps/api/src/services/orchestrator.ts`: tier routing and execution flow
- `apps/api/prisma/schema.prisma`: persistence model
- `packages/shared/src/constants/defaults.ts`: default action tiers and action catalog
- `agent/src/index.ts`: CLI loop and tool execution

## 3. Current Technology Stack

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- `@auth0/auth0-react`
- `socket.io-client`

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Socket.IO
- Zod
- Winston
- `express-oauth2-jwt-bearer`
- Auth0 Node SDK

### Agent

- TypeScript
- OpenAI Node SDK
- OpenRouter-compatible chat completions endpoint

### Local Infrastructure

- `docker-compose.yml` for PostgreSQL and Redis

Notes on drift from the older internal draft:

- The repo does not currently use `shadcn/ui`
- The agent does not currently use Vercel AI SDK or LangChain
- No CI workflow is checked into this repo today

## 4. High-Level Runtime Architecture

```text
User Browser -> Auth0 -> React Dashboard
                           |
                           v
                    Express API
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     PostgreSQL         Redis/BullMQ     Socket.IO
                           |
                           v
                    Approval timeouts

CLI Agent -> Auth0 M2M token -> Express API -> third-party service executors
```

Service executors are implemented for:

- Gmail
- GitHub
- Slack
- Notion

## 5. Core Domain Model

The persistence model lives in [apps/api/prisma/schema.prisma](/home/sc/AgentGurdian/apps/api/prisma/schema.prisma).

### `User`

Stores the local user record keyed by `auth0UserId`. The dashboard creates or refreshes this record through `GET /api/v1/auth/me`.

### `ServiceConnection`

Stores whether a service is connected or revoked for a user. It does not store raw OAuth tokens.

### `PermissionConfig`

Stores user overrides for `(user, service, actionType) -> tier`.

### `AuditLog`

Immutable execution history containing:

- service
- action type
- tier
- outcome status
- payload hash
- approver metadata
- step-up verification flag

### `PendingAction`

Tracks `NUDGE` and `STEP_UP` actions that are waiting for resolution.

## 6. Action and Tier Model

The canonical action list and default mappings live in [packages/shared/src/constants/defaults.ts](/home/sc/AgentGurdian/packages/shared/src/constants/defaults.ts).

Examples:

- GitHub reads default to `AUTO`
- GitHub issue/PR creation defaults to `NUDGE`
- GitHub merge/delete operations default to `STEP_UP`
- Unknown actions default to `STEP_UP` in `classifyTier()` as a fail-safe

The classifier order is:

1. Look for a user-specific `PermissionConfig`
2. Fall back to `DEFAULT_TIER_MAP`
3. Default unknown actions to `STEP_UP`

## 7. Request Lifecycles

### 7.1 `AUTO`

Implemented in `handleAutoTier()` in [apps/api/src/services/orchestrator.ts](/home/sc/AgentGurdian/apps/api/src/services/orchestrator.ts).

Flow:

1. Classify the action
2. Fetch a short-lived service token
3. Execute the provider action
4. Write an `EXECUTED` audit log
5. Emit a Socket.IO activity update

If token retrieval fails with a known service-connection problem:

- `404` becomes `ServiceNotConnectedError`
- `401` becomes `TokenExpiredError` and marks the connection as revoked

### 7.2 `NUDGE`

Implemented across:

- [apps/api/src/services/orchestrator.ts](/home/sc/AgentGurdian/apps/api/src/services/orchestrator.ts)
- [apps/api/src/services/nudgeService.ts](/home/sc/AgentGurdian/apps/api/src/services/nudgeService.ts)
- [apps/api/src/workers/nudgeWorker.ts](/home/sc/AgentGurdian/apps/api/src/workers/nudgeWorker.ts)

Flow:

1. Create `PendingAction`
2. Hash the payload
3. Store the payload in Redis at `nudge:payload:<jobId>` with a 70-second TTL
4. Schedule a BullMQ timeout job with a 60-second delay
5. Notify the dashboard through Socket.IO and optional web push
6. Write a `PENDING` audit log
7. On approval, execute the real action and write `EXECUTED`
8. On denial, write `DENIED`
9. On timeout, mark expired and write `EXPIRED`

### 7.3 `STEP_UP`

Implemented in [apps/api/src/services/orchestrator.ts](/home/sc/AgentGurdian/apps/api/src/services/orchestrator.ts) and [apps/api/src/middleware/stepUpAuth.ts](/home/sc/AgentGurdian/apps/api/src/middleware/stepUpAuth.ts).

Flow:

1. Create `PendingAction` with a 5-minute window
2. Persist payload in Redis if needed
3. Return a frontend `challengeUrl` like `/step-up?jobId=<id>`
4. Frontend completes the step-up UX and posts to `/api/v1/agent/action/:jobId/step-up`
5. Middleware checks MFA-related claims before allowing execution
6. Approved execution writes an audit row with `stepUpVerified = true`

Important implementation detail:

- In development, `requireStepUp()` contains a fresh-token bypass if Auth0 MFA claims are missing. That makes local demos possible, but it should be treated as a development-only path.

## 8. Auth Model

### 8.1 Dashboard Login

The frontend uses `@auth0/auth0-react` with:

- Auth0 Universal Login
- Authorization Code Flow with PKCE
- in-memory token cache
- refresh token support enabled in the SDK config

After login, the app calls `/api/v1/auth/me` to create or refresh the local user row. This also updates `updatedAt`, which is important for development-mode agent resolution.

### 8.2 API JWT Validation

The API uses `express-oauth2-jwt-bearer` in [apps/api/src/middleware/auth.ts](/home/sc/AgentGurdian/apps/api/src/middleware/auth.ts) to validate Auth0-issued JWTs.

### 8.3 CLI Agent Authentication

The CLI agent uses the client credentials grant in [agent/src/auth/getAgentToken.ts](/home/sc/AgentGurdian/agent/src/auth/getAgentToken.ts) and requests the `agent:act` scope.

Current acting-user resolution in [agent/src/auth/resolveActingUser.ts](/home/sc/AgentGurdian/agent/src/auth/resolveActingUser.ts):

- Production path: read `https://agentguardian.com/userId` from the M2M token
- Development path: fall back to the most recently active dashboard user
- When launched inside another git repository, the CLI also derives ambient GitHub repository context from `remote.origin.url` to help resolve phrases like `this repo`

The resolution endpoint is:

- `GET /api/v1/agent/whoami`

### 8.4 Service Connection and Token Retrieval

Connections are initiated through the API:

- `GET /api/v1/connections/:service/authorize`
- `GET /api/v1/connections/callback`
- `DELETE /api/v1/connections/:service`

Token retrieval happens in [apps/api/src/services/tokenVault.ts](/home/sc/AgentGurdian/apps/api/src/services/tokenVault.ts).

Current behavior:

1. Resolve the internal user ID to `auth0UserId`
2. Attempt `auth0Management.tokenVault.getToken(...)`
3. If the SDK method is unavailable, fall back to `auth0Management.users.get(...)` and read the matching identity access token
4. Throw a clean service error if the token is unavailable or the service is not connected

This means the code is written for Token Vault-style retrieval, but it also includes a pragmatic fallback for current Auth0 SDK behavior.

## 9. API Surface

The routes are mounted in [apps/api/src/app.ts](/home/sc/AgentGurdian/apps/api/src/app.ts).

### Auth

- `GET /api/v1/auth/health`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/push-subscription`

### Connections

- `GET /api/v1/connections`
- `GET /api/v1/connections/:service/authorize`
- `GET /api/v1/connections/callback`
- `DELETE /api/v1/connections/:service`

### Permissions

- `GET /api/v1/permissions`
- `PUT /api/v1/permissions`
- `PUT /api/v1/permissions/:service/:action`
- `GET /api/v1/permissions/defaults`
- `DELETE /api/v1/permissions/:service`

### Agent

- `POST /api/v1/agent/action`
- `GET /api/v1/agent/pending`
- `GET /api/v1/agent/action/:jobId/status`
- `POST /api/v1/agent/action/:jobId/approve`
- `POST /api/v1/agent/action/:jobId/deny`
- `POST /api/v1/agent/action/:jobId/step-up`
- `GET /api/v1/agent/whoami`

### Audit

- `GET /api/v1/audit`
- `GET /api/v1/audit/stats`
- `GET /api/v1/audit/:auditLogId`

## 10. Real-Time Events

Socket.IO is initialized in [apps/api/src/socket.ts](/home/sc/AgentGurdian/apps/api/src/socket.ts).

The server emits dashboard update events including:

- `activity:new`
- `nudge:request`
- `nudge:resolved`
- `nudge:expired`
- `stepup:required`
- `stepup:completed`
- `connection:revoked`

The web client connects through [apps/web/src/lib/socket.ts](/home/sc/AgentGurdian/apps/web/src/lib/socket.ts) and emits a `join` event using the Auth0 `sub` claim from the logged-in user session.

## 11. Supported Service Actions

### Gmail

- `gmail.read_emails`
- `gmail.search_emails`
- `gmail.read_attachments`
- `gmail.send_email`
- `gmail.reply_email`
- `gmail.send_to_external`
- `gmail.delete_email`
- `gmail.send_bulk`

### GitHub

- `github.read_repositories`
- `github.read_issues`
- `github.read_prs`
- `github.read_code`
- `github.read_branches`
- `github.create_issue`
- `github.comment_issue`
- `github.open_pr`
- `github.merge_pr`
- `github.merge_to_main`
- `github.push_code`
- `github.delete_branch`
- `github.close_issue`

### Slack

- `slack.read_channels`
- `slack.read_dms`
- `slack.post_to_channel`
- `slack.send_dm`
- `slack.post_to_general`
- `slack.create_channel`

### Notion

- `notion.read_pages`
- `notion.update_page`
- `notion.create_page`
- `notion.delete_page`
- `notion.share_page`

Implementation notes:

- `github.push_code` is currently a placeholder and does not perform real git transport
- `notion.share_page` currently returns a note rather than performing a workspace-sharing mutation

## 12. Environment Variables

The root example file is [/.env.example](/home/sc/AgentGurdian/.env.example). The agent has its own [agent/.env.example](/home/sc/AgentGurdian/agent/.env.example).

Important variables include:

- `DATABASE_URL`
- `REDIS_URL`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `AUTH0_CLIENT_ID`
- `AUTH0_M2M_CLIENT_ID`
- `AUTH0_M2M_CLIENT_SECRET`
- `FRONTEND_URL`
- `API_BASE_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `AGENT_AUTH0_CLIENT_ID`
- `AGENT_AUTH0_CLIENT_SECRET`
- `GUARDIAN_API_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

## 13. Local Development Workflow

The full operator-friendly startup guide now lives in [README.md](/home/sc/AgentGurdian/README.md). The notes below summarize the implementation-aware sequence.

### Start the stack

```bash
npm install
docker-compose up -d
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp agent/.env.example agent/.env
npm run db:migrate
npm run db:seed
npm run dev
```

### Start the agent

In a second terminal:

```bash
npm run dev -w agent
```

### Important development sequence

1. Start API and web app
2. Log into the dashboard once
3. Connect at least one provider
4. Start the CLI agent

If step 2 is skipped, the agent will not be able to resolve a user in development mode.

If you want the merged repo + CLI walkthrough, sample commands, or troubleshooting shortcuts, refer back to [README.md](/home/sc/AgentGurdian/README.md).

## 14. Current Implementation Notes and Caveats

- The root `npm run dev` does not start the agent process
- The health endpoint is mounted at `/api/v1/auth/health`
- User creation is lazy and happens through `/auth/me`
- Redis stores pending-action payloads temporarily, not long-lived credentials
- PostgreSQL stores connection state and audit metadata, not raw provider tokens
- Unknown action types intentionally fail closed to `STEP_UP`
- The current codebase documents and implements Auth0-centric flows, but local success still depends on tenant configuration and available Management API capabilities

## 15. Recommended Reading in This Repo

- [README.md](/home/sc/AgentGurdian/README.md)
- [docs/connecting-services.md](/home/sc/AgentGurdian/docs/connecting-services.md)
- [docs/auth0-m2m-action-setup.md](/home/sc/AgentGurdian/docs/auth0-m2m-action-setup.md)
- [docs/agent-dynamic-auth-changes.md](/home/sc/AgentGurdian/docs/agent-dynamic-auth-changes.md)

Use [README.md](/home/sc/AgentGurdian/README.md) for:

- local setup
- CLI usage examples
- repository-aware GitHub behavior
- common troubleshooting

## 16. Summary

The current implementation is a working monorepo with:

- a dashboard for login, permissions, connections, approvals, and audit history
- an API that classifies and orchestrates service actions
- a CLI agent that authenticates with Auth0 M2M, resolves an acting user, and submits actions through Guardian

The most important corrections from the previous internal draft are:

- the stack is simpler than originally described
- the agent currently uses the OpenAI SDK against OpenRouter
- dynamic acting-user resolution is already implemented
- the Auth0 token retrieval path includes a Management API fallback
- the documented API routes, storage model, and approval flows now match the code in this repo
