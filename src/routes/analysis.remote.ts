import { command } from '$app/server';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import {
	resumeAnalysis as resumeWorkflowAnalysis,
	startAnalysis,
	WorkflowAnalysisError
} from '#lib/server/analysis.js';
import type { AnalysisInput } from '#lib/analysis.js';

type AnalysisRequest = AnalysisInput & { instanceId: string };

function standardSchema<T>(
	validate: (value: unknown) => StandardSchemaV1.Result<T>
): StandardSchemaV1<unknown, T> {
	return {
		'~standard': {
			version: 1 as const,
			vendor: 'algolens',
			validate
		}
	};
}

const instanceIdPattern =
	/^analysis-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const analysisRequestSchema = standardSchema<AnalysisRequest>((value) => {
	if (typeof value !== 'object' || value === null) {
		return { issues: [{ message: 'Analysis input must be an object.' }] };
	}

	const input = value as Record<string, unknown>;
	if (typeof input.code !== 'string' || !input.code.trim()) {
		return { issues: [{ message: 'Code must be a non-empty string.', path: ['code'] }] };
	}
	if (typeof input.language !== 'string' || !input.language.trim()) {
		return { issues: [{ message: 'Language must be a non-empty string.', path: ['language'] }] };
	}
	if (typeof input.instanceId !== 'string' || !instanceIdPattern.test(input.instanceId)) {
		return { issues: [{ message: 'Workflow instance ID is invalid.', path: ['instanceId'] }] };
	}

	return {
		value: {
			code: input.code,
			language: input.language,
			instanceId: input.instanceId
		}
	};
});

const instanceIdSchema = standardSchema<string>((value) => {
	if (typeof value !== 'string' || !instanceIdPattern.test(value)) {
		return { issues: [{ message: 'Workflow instance ID is invalid.' }] };
	}
	return { value };
});

function getWorkflow(): Workflow<AnalysisInput> {
	if (!env.ANALYSIS_WORKFLOW) {
		error(503, 'Cloudflare bindings are unavailable. Run npm run dev to use the full application.');
	}
	return env.ANALYSIS_WORKFLOW;
}

function handleWorkflowError(cause: unknown): never {
	if (cause instanceof WorkflowAnalysisError) {
		switch (cause.kind) {
			case 'errored':
				error(500, 'Analysis failed. Please try again.');
			case 'terminated':
				error(409, 'Analysis was terminated. Please try again.');
			case 'invalid-output':
				error(502, 'Analysis returned an invalid result. Please try again.');
			case 'subscription':
				error(503, 'The analysis connection was interrupted. Reload to recover it.');
		}
	}

	console.error('Workflow request failed:', cause);
	error(500, 'Unable to run the analysis. Please try again.');
}

export const analyse = command(analysisRequestSchema, async ({ code, language, instanceId }) => {
	const workflow = getWorkflow();
	try {
		return await startAnalysis(workflow, instanceId, { code, language });
	} catch (cause) {
		handleWorkflowError(cause);
	}
});

export const recoverAnalysis = command(instanceIdSchema, async (instanceId) => {
	const workflow = getWorkflow();
	try {
		return await resumeWorkflowAnalysis(workflow, instanceId);
	} catch (cause) {
		handleWorkflowError(cause);
	}
});
