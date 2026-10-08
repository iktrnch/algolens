import type { AnalysisInput } from '../analysis.ts';

export interface CloudflareEnv {
	AI: Ai;
	ASSETS: Fetcher;
	ANALYSIS_WORKFLOW: Workflow<AnalysisInput>;
}
