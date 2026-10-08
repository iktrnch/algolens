import { error } from '@sveltejs/kit';
import { getAnalysisAgent } from '$lib/server/agent';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, platform, url }) => {
	let input: unknown;
	try {
		input = await request.json();
	} catch {
		error(400, 'Request body must be valid JSON.');
	}
	if (
		typeof input !== 'object' ||
		input === null ||
		!('code' in input) ||
		typeof input.code !== 'string' ||
		!input.code.trim() ||
		!('language' in input) ||
		typeof input.language !== 'string' ||
		!input.language.trim()
	) {
		error(400, 'Code and language must be non-empty strings.');
	}

	const agent = await getAnalysisAgent(platform, params.sessionId);
	return agent.fetch(
		new Request(new URL('/analyse', url), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code: input.code, language: input.language })
		})
	);
};
