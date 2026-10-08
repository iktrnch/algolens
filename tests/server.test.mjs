import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

const workers = `
export class WorkflowEntrypoint {
	constructor(ctx, env) { this.env = env; }
}
`;
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === 'cloudflare:workers') {
			return { url: `data:text/javascript,${encodeURIComponent(workers)}`, shortCircuit: true };
		}
		return nextResolve(specifier, context);
	}
});

const { GET: health } =
	await import('../.svelte-kit/output/server/entries/endpoints/api/health/_server.ts.js');
const { awaitAnalysis, resumeAnalysis, startAnalysis, WorkflowAnalysisError } =
	await import('../src/lib/server/analysis.ts');
const { AlgorithmAnalysisWorkflow } = await import('../src/lib/server/workflows/analyse.ts');

function mockInstance(event, options = {}) {
	let disposed = 0;
	let filter;
	const subscription = {
		async next() {
			if (options.nextError) throw options.nextError;
			return event;
		},
		[Symbol.dispose]() {
			disposed += 1;
		}
	};

	return {
		instance: {
			async subscribe(subscriptionOptions) {
				filter = subscriptionOptions.filter;
				return subscription;
			}
		},
		get disposed() {
			return disposed;
		},
		get filter() {
			return filter;
		}
	};
}

const analysisResult = {
	explanation: 'Finds the target in a sorted array.',
	complexity: { time: 'O(log n)', space: 'O(1)', explanation: 'Halves the range.' },
	improvements: ['Handle empty inputs.']
};

test('health is available without Cloudflare bindings', async () => {
	assert.deepEqual(await health().json(), { status: 'ok' });
});

test('completed Workflow events return the typed result and dispose the subscription', async () => {
	const mock = mockInstance({
		done: false,
		value: { type: 'workflow_completed', output: analysisResult }
	});

	assert.deepEqual(await awaitAnalysis(mock.instance), analysisResult);
	assert.deepEqual(mock.filter, ['workflow_completed', 'workflow_errored', 'workflow_terminated']);
	assert.equal(mock.disposed, 1);
});

test('Workflow errors and termination are surfaced and subscriptions are disposed', async () => {
	for (const [value, kind] of [
		[{ type: 'workflow_errored', error: { name: 'Error', message: 'AI failed' } }, 'errored'],
		[{ type: 'workflow_terminated' }, 'terminated']
	]) {
		const mock = mockInstance({ done: false, value });
		await assert.rejects(
			awaitAnalysis(mock.instance),
			(error) => error instanceof WorkflowAnalysisError && error.kind === kind
		);
		assert.equal(mock.disposed, 1);
	}
});

test('subscription failures are recoverable and still dispose the RPC resource', async () => {
	const mock = mockInstance(undefined, { nextError: new Error('RPC disconnected') });
	await assert.rejects(
		awaitAnalysis(mock.instance),
		(error) => error instanceof WorkflowAnalysisError && error.kind === 'subscription'
	);
	assert.equal(mock.disposed, 1);
});

test('start and recovery use the same explicit Workflow instance without polling', async () => {
	const first = mockInstance({
		done: false,
		value: { type: 'workflow_completed', output: analysisResult }
	});
	const calls = [];
	const workflow = {
		async create(options) {
			calls.push(['create', options]);
			return first.instance;
		},
		async get(id) {
			calls.push(['get', id]);
			return first.instance;
		}
	};
	const input = { code: 'print(1)', language: 'python' };

	assert.deepEqual(await startAnalysis(workflow, 'analysis-id', input), analysisResult);
	assert.deepEqual(await resumeAnalysis(workflow, 'analysis-id'), analysisResult);
	assert.deepEqual(calls, [
		['create', { id: 'analysis-id', params: input }],
		['get', 'analysis-id']
	]);
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
