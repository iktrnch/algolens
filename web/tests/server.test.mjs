import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// Exercise the built SvelteKit handlers while replacing only Cloudflare's SDK boundary.
const agents = `
export const getAgentByName = (...args) => globalThis.agentSDK.getAgentByName(...args);
export const routeAgentRequest = (...args) => globalThis.agentSDK.routeAgentRequest(...args);
`;
const workers = `
export class WorkflowEntrypoint {
	constructor(ctx, env) { this.env = env; }
}
`;
registerHooks({
	resolve(specifier, context, nextResolve) {
		const source =
			specifier === 'agents' ? agents : specifier === 'cloudflare:workers' ? workers : null;
		if (source) {
			return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
		}
		return nextResolve(specifier, context);
	}
});

const { POST } =
	await import('../.svelte-kit/output/server/entries/endpoints/api/analyse/_sessionId_/_server.ts.js');
const { GET: status } =
	await import('../.svelte-kit/output/server/entries/endpoints/api/status/_sessionId_/_server.ts.js');
const { GET: health } =
	await import('../.svelte-kit/output/server/entries/endpoints/api/health/_server.ts.js');
const { handle } = await import('../.svelte-kit/output/server/entries/hooks.server.js');
const { AlgorithmAnalysisWorkflow } = await import('../src/lib/server/workflows/analyse.ts');

function event(body, platform) {
	const url = new URL('https://algolens.example/api/analyse/session-123');
	return {
		url,
		request: new Request(url, { method: 'POST', body }),
		params: { sessionId: 'session-123' },
		platform
	};
}

test('health is available without Cloudflare bindings', async () => {
	assert.deepEqual(await health().json(), { status: 'ok' });
});

test('invalid analysis requests fail before contacting the Durable Object', async () => {
	for (const body of [
		'{',
		'null',
		'[]',
		'{}',
		'{"code":"","language":"python"}',
		'{"code":"x","language":42}'
	]) {
		await assert.rejects(POST(event(body)), (error) => error.status === 400);
	}
});

test('valid requests report unavailable bindings clearly', async () => {
	await assert.rejects(
		POST(event(JSON.stringify({ code: 'print(1)', language: 'python' }))),
		(error) => error.status === 503
	);
});

test('analysis and status resolve the same session and preserve the agent response', async () => {
	const namespace = {};
	const requests = [];
	const response = Response.json(
		{ status: 'running', workflowId: 'workflow-123' },
		{ status: 202 }
	);
	globalThis.agentSDK = {
		async getAgentByName(binding, sessionId) {
			assert.equal(binding, namespace);
			assert.equal(sessionId, 'session-123');
			return {
				fetch: async (request) => {
					requests.push(request);
					return response;
				}
			};
		}
	};
	const input = { code: 'print(1)', language: 'python' };
	const requestEvent = event(JSON.stringify(input), { env: { AnalysisAgent: namespace } });
	assert.equal(await POST(requestEvent), response);
	assert.equal(requests[0].method, 'POST');
	assert.equal(new URL(requests[0].url).pathname, '/analyse');
	assert.deepEqual(await requests[0].json(), input);
	assert.equal(await status(requestEvent), response);
	assert.equal(requests[1].method, 'GET');
});

test('agent protocol requests pass through the SvelteKit hook', async () => {
	const requestEvent = event('', { env: { AnalysisAgent: {} } });
	requestEvent.url = new URL('https://algolens.example/agents/analysis-agent/session-123');
	const response = Response.json({ status: 'idle' });
	globalThis.agentSDK = {
		async routeAgentRequest(request, env) {
			assert.equal(request, requestEvent.request);
			assert.equal(env, requestEvent.platform.env);
			return response;
		}
	};
	assert.equal(
		await handle({ event: requestEvent, resolve: () => assert.fail('unexpected resolve') }),
		response
	);
	const ordinary = event('');
	assert.equal(await handle({ event: ordinary, resolve: () => response }), response);
});

test('the workflow keeps all three AI steps and parses fenced structured results', async () => {
	const results = [
		{ response: 'Finds the target in a sorted array.' },
		{
			response:
				'```json\n{"time":"O(log n)","space":"O(1)","explanation":"Halves the search range."}\n```'
		},
		{ response: '```json\n[["Handle empty inputs.", "Document sorted input."]]\n```' }
	];
	const calls = [];
	const workflow = new AlgorithmAnalysisWorkflow(
		{},
		{
			AI: {
				async run(model, input) {
					calls.push({ model, input });
					return results.shift();
				}
			}
		}
	);
	const steps = [];
	const result = await workflow.run(
		{ payload: { code: 'binary_search(arr, target)', language: 'python' } },
		{
			async do(name, callback) {
				steps.push(name);
				return callback();
			}
		}
	);
	assert.deepEqual(steps, ['explain algorithm', 'analyse complexity', 'suggest improvements']);
	assert.equal(calls.length, 3);
	assert.ok(
		calls.every((call) => call.input.messages[1].content.includes('binary_search(arr, target)'))
	);
	assert.deepEqual(result, {
		explanation: 'Finds the target in a sorted array.',
		complexity: { time: 'O(log n)', space: 'O(1)', explanation: 'Halves the search range.' },
		improvements: ['Handle empty inputs.', 'Document sorted input.']
	});
});
