import { getAnalysisAgent } from '$lib/server/agent';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	const agent = await getAnalysisAgent(platform, params.sessionId);
	return agent.fetch(new Request('https://agent/'));
};
