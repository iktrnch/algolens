import adapter from '@sveltejs/adapter-cloudflare';
import { appendFile } from 'node:fs/promises';

const cloudflare = adapter();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: {
			...cloudflare,
			async adapt(builder) {
				await cloudflare.adapt(builder);
				// Cloudflare discovers Durable Objects and Workflows through named exports.
				// The stock adapter only exports SvelteKit's fetch handler.
				await appendFile(
					'.svelte-kit/cloudflare/_worker.js',
					'\nexport { AnalysisAgent } from "../../src/lib/server/agents/analysis.ts";\n' +
						'export { AlgorithmAnalysisWorkflow } from "../../src/lib/server/workflows/analyse.ts";\n'
				);
			}
		}
	}
};

export default config;
