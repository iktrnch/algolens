# AlgoLens

AlgoLens leverages the power of AI and allows you to analyse your algorithms.
Digest of your algorithms provides the explanation, space and time complexity and suggestions how to improve.

## Usage
### Website (recommended)
1. Go to [algolens.def1de.com](https://algolens.def1de.com/)
2. Select your language
3. Paste your algorithm to the box below or click *load example* to see a demo. (Only python and JS examples available)
4. Click *Run Analysis* button and wait for the result

### Local
1. Clone this repo
```
git clone https://github.com/iktrnch/cf_ai_algolens.git algolens
cd ./algolens
```
2. Install dependencies and start the SvelteKit application
```sh
cd web
npm install
npx wrangler login
npm run dev
```
3. Go to [localhost:8787](http://localhost:8787)
4. Select your language
5. Paste your algorithm or click *load example* (Python and JavaScript examples available)
6. Click *Run Analysis* and wait for the result

The frontend, REST API, Durable Object agent, and AI Workflow all live in `web` and deploy
as one Cloudflare Worker. Workers AI uses your Cloudflare account during local development.
After editing SvelteKit routes or UI, rebuild with `npm run build` in another terminal or
restart `npm run dev`. Wrangler watches the generated application and agent/workflow sources.

For UI development with Vite hot reload, use `npm run dev:ui`. Full analysis and agent
connections require the Wrangler runtime started by `npm run dev`.

From `web`, run `npm run check` for type checking, `npm test` for server tests, and
`npm run deploy` to build and deploy. See [web/README.md](web/README.md) for architecture and
deployment details.
