import { error } from '@sveltejs/kit';

export function getCloudflareEnv(platform: App.Platform | undefined): Env {
	if (!platform?.env?.AnalysisAgent) {
		error(503, 'Cloudflare bindings are unavailable. Run npm run dev to use the full application.');
	}
	return platform.env;
}

export async function getAnalysisAgent(platform: App.Platform | undefined, sessionId: string) {
	const env = getCloudflareEnv(platform);
	// Defer loading the SDK until a request runs in the Cloudflare runtime.
	const { getAgentByName } = await import('agents');
	return getAgentByName(env.AnalysisAgent, sessionId);
}
