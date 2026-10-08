import type { AnalysisAgent } from './agents/analysis';
import type { AnalysisInput } from './workflows/analyse';

export interface CloudflareEnv {
	AI: Ai;
	ASSETS: Fetcher;
	AnalysisAgent: DurableObjectNamespace<AnalysisAgent>;
	ANALYSIS_WORKFLOW: Workflow<AnalysisInput>;
}
