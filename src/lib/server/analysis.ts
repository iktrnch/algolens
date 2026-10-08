import type { AnalysisInput, AnalysisResult } from '../analysis.ts';

const TERMINAL_EVENTS = [
	'workflow_completed',
	'workflow_errored',
	'workflow_terminated'
] satisfies WorkflowInstanceEventType[];

export class WorkflowAnalysisError extends Error {
	readonly kind: 'errored' | 'terminated' | 'subscription' | 'invalid-output';

	constructor(message: string, kind: 'errored' | 'terminated' | 'subscription' | 'invalid-output') {
		super(message);
		this.name = 'WorkflowAnalysisError';
		this.kind = kind;
	}
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
	if (typeof value !== 'object' || value === null) return false;

	const result = value as Partial<AnalysisResult>;
	return (
		typeof result.explanation === 'string' &&
		typeof result.complexity === 'object' &&
		result.complexity !== null &&
		typeof result.complexity.time === 'string' &&
		typeof result.complexity.space === 'string' &&
		typeof result.complexity.explanation === 'string' &&
		Array.isArray(result.improvements) &&
		result.improvements.every((item) => typeof item === 'string')
	);
}

export async function awaitAnalysis(instance: WorkflowInstance): Promise<AnalysisResult> {
	let subscription: WorkflowInstanceSubscription | undefined;

	try {
		subscription = await instance.subscribe({ filter: TERMINAL_EVENTS });
		const event = await subscription.next();

		if (event.done) {
			throw new WorkflowAnalysisError(
				'The Workflow subscription ended without a terminal event.',
				'subscription'
			);
		}

		switch (event.value.type) {
			case 'workflow_completed':
				if (!isAnalysisResult(event.value.output)) {
					throw new WorkflowAnalysisError(
						'The Workflow returned an invalid analysis result.',
						'invalid-output'
					);
				}
				return event.value.output;

			case 'workflow_errored':
				throw new WorkflowAnalysisError(event.value.error.message, 'errored');

			case 'workflow_terminated':
				throw new WorkflowAnalysisError('The analysis Workflow was terminated.', 'terminated');

			default:
				throw new WorkflowAnalysisError(
					`Received unexpected Workflow event: ${event.value.type}`,
					'subscription'
				);
		}
	} catch (cause) {
		if (cause instanceof WorkflowAnalysisError) throw cause;
		throw new WorkflowAnalysisError(
			cause instanceof Error ? cause.message : 'The Workflow subscription failed.',
			'subscription'
		);
	} finally {
		subscription?.[Symbol.dispose]();
	}
}

export async function startAnalysis(
	workflow: Workflow<AnalysisInput>,
	instanceId: string,
	input: AnalysisInput
): Promise<AnalysisResult> {
	const instance = await workflow.create({ id: instanceId, params: input });
	return awaitAnalysis(instance);
}

export async function resumeAnalysis(
	workflow: Workflow<AnalysisInput>,
	instanceId: string
): Promise<AnalysisResult> {
	const instance = await workflow.get(instanceId);
	return awaitAnalysis(instance);
}
