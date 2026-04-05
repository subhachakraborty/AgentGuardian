# Agent Guardian

Agent Guardian is a trust layer for AI agents acting on a user's behalf. It sits between an agent and third-party APIs, classifies each requested action into `AUTO`, `NUDGE`, or `STEP_UP`, and enforces the right approval flow before anything executes.

This repo includes:

- A React dashboard for login, service connections, permissions, approvals, and audit history
- An Express API for Auth0 auth, orchestration, tier classification, audit logging, and provider execution
- A CLI agent that uses an OpenRouter-backed LLM and routes actions through the Guardian API

## Trust Model

- `AUTO`: safe actions execute immediately
- `NUDGE`: sensitive actions wait for user approval in a 60-second window
- `STEP_UP`: high-risk actions require MFA-backed confirmation before execution
- OAuth tokens are fetched on demand instead of being stored in the app database

## Repo Layout

```text
apps/web        React + Vite dashboard
apps/api        Express + Prisma API
agent           CLI agent
packages/shared Shared enums, defaults, and action metadata
docs            Setup and deployment notes
```

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, TanStack Query, Zustand, Auth0 React SDK, Socket.IO client
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, Socket.IO, Zod, Winston
- Agent: TypeScript, OpenAI SDK using the OpenRouter API
- Auth: Auth0 Universal Login, Auth0 Management API, Token Vault-style service token retrieval

## Quick Start

### 1. Install dependencies

```bash
git clone git@github.com:subhachakraborty/AgentGuardian.git
cd AgentGuardian
npm install
```

### 2. Start local infrastructure

```bash
docker-compose up -d
```

This brings up PostgreSQL and Redis for the API.

### 3. Configure environment files

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp agent/.env.example agent/.env
```

Fill in:

- Auth0 values in `apps/api/.env` and `apps/web/.env`
- Agent M2M credentials in `agent/.env`
- `OPENROUTER_API_KEY` in `agent/.env`

### 4. Prepare the database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start the dashboard and API

```bash
npm run dev
```

- Web dashboard: `http://localhost:5173`
- API: `http://localhost:3001`

### 6. Log in through the dashboard

Log in once at `http://localhost:5173`. The dashboard calls `/api/v1/auth/me` to create or refresh your local user record, which the CLI uses in development mode.

### 7. Connect a service

Open the Connections page and authorize at least one provider such as GitHub, Gmail, Slack, or Notion.

### 8. Start the CLI agent

```bash
npm run dev -w agent
```

## Agent CLI

The agent is interactive and acts on behalf of the currently resolved user.

Example session:

```text
User> list my GitHub repositories
User> create an issue in my-repo
User> exit
```

### Agent scripts

- `npm run dev -w agent`: run the agent
- `npm run start -w agent`: same as `dev`
- `npm run dev:watch -w agent`: watch mode for local agent development

### Agent environment

`agent/.env` should include:

```bash
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.agentguardian.com
AGENT_AUTH0_CLIENT_ID=your_m2m_client_id
AGENT_AUTH0_CLIENT_SECRET=your_m2m_client_secret
GUARDIAN_API_URL=http://localhost:3001
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## How the Agent Resolves the Acting User

- Development mode: the API uses the most recently active dashboard user
- Production mode: an Auth0 M2M Action can inject `https://agentguardian.com/userId` into the agent token

That flow is documented in [docs/auth0-m2m-action-setup.md](/home/sc/AgentGurdian/docs/auth0-m2m-action-setup.md).

## Repository-Aware GitHub Behavior

When you run the agent inside another git repository, it inspects `remote.origin.url` and uses that as ambient GitHub context.

Example:

```bash
cd /path/to/my-project
npm run dev -w /path/to/AgentGuardian/agent
```

The agent can then interpret phrases like:

- `create an issue in this repo`
- `open a PR in other-repo`
- `merge PR 42 in owner/repo`

If `owner` is omitted, the backend tries to infer the authenticated GitHub username from the GitHub token.

## Supported Services

- Gmail
- GitHub
- Slack
- Notion

Default action tiers live in [packages/shared/src/constants/defaults.ts](/home/sc/AgentGurdian/packages/shared/src/constants/defaults.ts).

### Current GitHub actions in the agent flow

- `github.read_repositories`
- `github.read_issues`
- `github.read_prs`
- `github.read_code`
- `github.read_branches`
- `github.create_issue`
- `github.comment_issue`
- `github.open_pr`
- `github.merge_pr`
- `github.close_issue`
- `github.delete_branch`

For the full cross-service action catalog, see [packages/shared/src/constants/defaults.ts](/home/sc/AgentGurdian/packages/shared/src/constants/defaults.ts).

## Example Approval Flow

### `AUTO`

```text
User> show me my GitHub repositories
Agent reads data and returns the result immediately.
```

### `NUDGE`

```text
User> create an issue titled "Fix bug" in my-repo
Action enters pending approval.
User approves in the dashboard.
Action executes and the result is returned to the agent.
```

### `STEP_UP`

```text
User> merge PR #42 in my-repo
Action requires elevated confirmation.
User completes MFA-backed approval in the dashboard.
Action executes after verification.
```

## Architecture Summary

```text
Dashboard -> Auth0 login -> Guardian API
CLI Agent -> M2M token -> Guardian API
Guardian API -> classify tier -> fetch service token -> execute provider action
Guardian API -> PostgreSQL + Redis + Socket.IO for state, audit, and approvals
```

## Development Notes

- The root `npm run dev` starts the API and web app only
- Start the CLI separately with `npm run dev -w agent`
- Unknown actions default to `STEP_UP` as a fail-safe
- Connection metadata is stored in PostgreSQL, but raw provider tokens are not
- `GitHub` owner resolution is dynamic when the LLM omits `owner`

## Troubleshooting

### Agent cannot resolve the acting user

- Log into the dashboard first at `http://localhost:5173`
- This creates or refreshes the local user profile used in development mode

### Agent token fetch failed

- Check `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AGENT_AUTH0_CLIENT_ID`, and `AGENT_AUTH0_CLIENT_SECRET` in `agent/.env`
- Confirm the Auth0 M2M application is configured correctly

### Service is not connected

- Go to the Connections page in the dashboard
- Connect or reconnect the provider

### Agent uses the wrong repository

- Specify the repo name explicitly
- Use `owner/repo` if you want a repository outside your default account

### Watch mode flickers

- Prefer `npm run dev -w agent` for normal use
- Use `npm run dev:watch -w agent` only when actively modifying agent code

## Main Docs

- [AgentGuardian_DeveloperDocs_v1.2.md](/home/sc/AgentGurdian/AgentGuardian_DeveloperDocs_v1.2.md)
- [docs/connecting-services.md](/home/sc/AgentGurdian/docs/connecting-services.md)
- [docs/auth0-m2m-action-setup.md](/home/sc/AgentGurdian/docs/auth0-m2m-action-setup.md)
- [docs/agent-dynamic-auth-changes.md](/home/sc/AgentGurdian/docs/agent-dynamic-auth-changes.md)
- [docs/deploy-aws-ec2.md](/home/sc/AgentGurdian/docs/deploy-aws-ec2.md)

## License

MIT
