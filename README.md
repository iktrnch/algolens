# AlgoLens SvelteKit application

This directory contains the complete application. SvelteKit serves the frontend and these
same-origin REST endpoints:

| Endpoint                       | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `POST /api/analyse/:sessionId` | Start an analysis with a JSON `{ code, language }` body. |
| `GET /api/status/:sessionId`   | Read the session's stored analysis state.                |
| `GET /api/health`              | Return `{ "status": "ok" }`.                             |

`src/hooks.server.ts` forwards `/agents/*` HTTP and WebSocket requests through the Cloudflare
Agents SDK. `src/lib/server/agents/analysis.ts` stores per-session state in a Durable Object.
`src/lib/server/workflows/analyse.ts` runs the three Workers AI steps: explanation, complexity,
and improvements.

## Development

Use Node.js 22.18 or newer (the tests use Node's TypeScript support and module hooks).

```sh
npm install
npx wrangler login
npm run dev
```

Open <http://localhost:8787>. This builds SvelteKit and runs the whole application in workerd.
Workers AI requires Cloudflare authentication and uses your account's AI quota. For a local
smoke test without AI access, use `npm run build` followed by `npx wrangler dev --local`.

After editing UI, hooks, or REST endpoints, run `npm run build` in another terminal or restart
the dev command. Wrangler reloads the generated application automatically. Agent and Workflow
source changes are watched directly by Wrangler. `npm run dev:ui` provides Vite hot reload for
UI work; the stock adapter's Vite platform proxy cannot run this application's internal
Durable Object and Workflow classes, so use the Wrangler runtime for full API testing.

```sh
npm run check
npm test
npm run lint
```

The tests build SvelteKit and exercise the compiled API handlers and hook with a mocked Agents
SDK, plus the Workflow's three steps with mocked AI responses. They do not invoke Workers AI.
Run `npm run types` after changing the Cloudflare compatibility date or flags. Environment
bindings are typed in `src/lib/server/env.ts`; generated runtime declarations live in
`worker-configuration.d.ts`.

## Deployment

```sh
npm run deploy
```

`wrangler.toml` retains the existing `code-analyzer` Worker name, `AnalysisAgent` Durable Object
binding and `v1` migration, and `algorithm-analysis` Workflow. Keeping these identifiers
preserves existing deployed session storage. The `ASSETS` binding serves SvelteKit's generated
static assets.

`svelte.config.js` extends the official Cloudflare adapter to add named exports for the Agent
and Workflow to `.svelte-kit/cloudflare/_worker.js`. These exports are required by Cloudflare
and are otherwise absent from the adapter output. All application routing remains in SvelteKit.
Do not point Wrangler's `main` at a source file: the adapter writes the generated entrypoint
there during a build. Deploy to Cloudflare Workers so that the Durable Object and Workflow
classes are included in the same deployment.
