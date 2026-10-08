import adapter from '@sveltejs/adapter-cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { appendFile } from 'node:fs/promises';
import { defineConfig } from 'vite';

const cloudflare = adapter();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: {
				...cloudflare,
				async adapt(builder) {
					await cloudflare.adapt(builder);
					// Cloudflare discovers Workflows through named exports.
					// The stock adapter only exports SvelteKit's fetch handler.
					await appendFile(
						'.svelte-kit/cloudflare/_worker.js',
						'\nexport { AlgorithmAnalysisWorkflow } from "../../src/lib/server/workflows/analyse.ts";\n'
					);
				}
			},
			compilerOptions: {
				experimental: {
					async: true
				}
			},
			experimental: {
				remoteFunctions: true
			}
		})
	]
});
