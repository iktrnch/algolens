import type { Handle } from '@sveltejs/kit';
import { getCloudflareEnv } from '$lib/server/agent';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/agents/')) {
		const { routeAgentRequest } = await import('agents');
		const response = await routeAgentRequest(event.request, getCloudflareEnv(event.platform));
		if (response) return response;
	}

	return resolve(event);
};
