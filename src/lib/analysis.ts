export type AnalysisInput = {
	code: string;
	language: string;
};

export type AnalysisResult = {
	explanation: string;
	complexity: {
		time: string;
		space: string;
		explanation: string;
	};
	improvements: string[];
};
