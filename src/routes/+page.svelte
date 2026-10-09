<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnalysisInput, AnalysisResult } from '#lib/analysis.js';
	import { analyse as analyseRemote, recoverAnalysis } from './analysis.remote';

	type Theme = 'light' | 'dark';
	type AnalysisState = {
		status: 'idle' | 'running' | 'complete' | 'error';
		result: AnalysisResult | null;
		error: string | null;
		code: string | null;
		language: string | null;
		recovered: boolean;
	};
	type PendingAnalysis = AnalysisInput & { instanceId: string };

	let code = $state('');
	let language = $state('python');
	let theme = $state<Theme>('light');
	let analysisState = $state<AnalysisState>({
		status: 'idle',
		result: null,
		error: null,
		code: null,
		language: null,
		recovered: false
	});
	const pendingAnalysisKey = 'algolensPendingAnalysis';
	const themeKey = 'algolensTheme';
	const languages = [
		{ value: 'python', label: 'Python' },
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'typescript', label: 'TypeScript' },
		{ value: 'java', label: 'Java' },
		{ value: 'cpp', label: 'C++' },
		{ value: 'c', label: 'C' },
		{ value: 'go', label: 'Go' },
		{ value: 'rust', label: 'Rust' }
	];
	const examples: Record<string, string> = {
		python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
		javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`
	};

	let resultIsStale = $derived(
		analysisState.status === 'complete' &&
			(code !== analysisState.code || language !== analysisState.language)
	);
	let selectedLanguage = $derived(
		languages.find((item) => item.value === language)?.label ?? language
	);

	function getErrorMessage(cause: unknown): string {
		if (
			typeof cause === 'object' &&
			cause !== null &&
			'message' in cause &&
			typeof cause.message === 'string'
		)
			return cause.message;
		return 'Unable to run the analysis. Please try again.';
	}

	function isRecoverableConnectionError(cause: unknown): boolean {
		if (typeof cause !== 'object' || cause === null || !('status' in cause)) return true;
		return cause.status === 503;
	}

	function finishAnalysis(result: AnalysisResult, input: AnalysisInput) {
		analysisState = {
			status: 'complete',
			result,
			error: null,
			code: input.code,
			language: input.language,
			recovered: false
		};
	}

	async function analyse(input: AnalysisInput): Promise<AnalysisResult> {
		const pending: PendingAnalysis = { ...input, instanceId: `analysis-${crypto.randomUUID()}` };
		sessionStorage.setItem(pendingAnalysisKey, JSON.stringify(pending));
		try {
			const result = await analyseRemote(pending);
			sessionStorage.removeItem(pendingAnalysisKey);
			return result;
		} catch (cause) {
			if (!isRecoverableConnectionError(cause)) sessionStorage.removeItem(pendingAnalysisKey);
			throw cause;
		}
	}

	async function runAnalysis() {
		if (!code.trim() || analysisState.status === 'running') return;
		const input = { code, language };
		analysisState = {
			status: 'running',
			result: null,
			error: null,
			code: input.code,
			language: input.language,
			recovered: false
		};
		try {
			finishAnalysis(await analyse(input), input);
		} catch (cause) {
			analysisState = { ...analysisState, status: 'error', error: getErrorMessage(cause) };
		}
	}

	function getPendingAnalysis(): PendingAnalysis | null {
		const stored = sessionStorage.getItem(pendingAnalysisKey);
		if (!stored) return null;
		try {
			const value = JSON.parse(stored) as Partial<PendingAnalysis>;
			if (
				typeof value.code === 'string' &&
				typeof value.language === 'string' &&
				typeof value.instanceId === 'string'
			)
				return value as PendingAnalysis;
		} catch {
			/* Invalid session data is cleared below. */
		}
		sessionStorage.removeItem(pendingAnalysisKey);
		return null;
	}

	async function recoverPendingAnalysis() {
		const pending = getPendingAnalysis();
		if (!pending) return;
		code = pending.code;
		language = pending.language;
		analysisState = {
			status: 'running',
			result: null,
			error: null,
			code: pending.code,
			language: pending.language,
			recovered: true
		};
		try {
			const result = await recoverAnalysis(pending.instanceId);
			sessionStorage.removeItem(pendingAnalysisKey);
			finishAnalysis(result, pending);
		} catch (cause) {
			if (!isRecoverableConnectionError(cause)) sessionStorage.removeItem(pendingAnalysisKey);
			analysisState = { ...analysisState, status: 'error', error: getErrorMessage(cause) };
		}
	}

	function loadExample() {
		if (examples[language]) code = examples[language];
		else {
			language = 'python';
			code = examples.python;
		}
	}

	function clearResult() {
		sessionStorage.removeItem(pendingAnalysisKey);
		analysisState = {
			status: 'idle',
			result: null,
			error: null,
			code: null,
			language: null,
			recovered: false
		};
	}

	function handleEditorKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			void runAnalysis();
		}
	}

	function applyTheme(nextTheme: Theme) {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
		document.documentElement.style.colorScheme = nextTheme;
		localStorage.setItem(themeKey, nextTheme);
	}

	function toggleTheme() {
		applyTheme(theme === 'light' ? 'dark' : 'light');
	}

	onMount(() => {
		const stored = localStorage.getItem(themeKey);
		const preferred: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		applyTheme(stored === 'dark' || stored === 'light' ? stored : preferred);
		void recoverPendingAnalysis();
	});
</script>

<svelte:head>
	<title>AlgoLens — Understand your algorithm</title>
	<meta
		name="description"
		content="Turn an algorithm into a clear explanation, complexity assessment, and practical improvements."
	/>
</svelte:head>

<div class="app-shell">
	<header class="site-header">
		<a class="wordmark" href="/" aria-label="AlgoLens home">
			<svg viewBox="0 0 32 32" aria-hidden="true"
				><path d="M8 7h7v7H8zM17 18h7v7h-7z"></path><path
					d="M15 10.5h4.5V18M12 14v7.5h5"
					fill="none"
				></path></svg
			>
			<span>AlgoLens</span>
		</a>
		<div class="header-actions">
			<a
				class="header-control github-link"
				href="https://github.com/iktrnch/algolens"
				aria-label="View AlgoLens on GitHub"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
					></path>
				</svg>
			</a>
			<button
				class="header-control theme-toggle"
				type="button"
				onclick={toggleTheme}
				aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					{#if theme === 'light'}<path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z"
						></path>
					{:else}<circle cx="12" cy="12" r="3.5"></circle><path
							d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
						></path>{/if}
				</svg>
			</button>
		</div>
	</header>

	<main>
		<section class="introduction" aria-labelledby="page-title">
			<h1 id="page-title">See how your algorithm works.</h1>
			<p>Paste code to see what it does, how it scales, and how to improve it.</p>
		</section>

		<section class="workspace" aria-label="Algorithm analysis workspace">
			<div class="input-column">
				<div class="section-heading">
					<div>
						<h2>Your algorithm</h2>
						<p>Choose the language, then paste the code you want to understand.</p>
					</div>
					<button class="text-button" type="button" onclick={loadExample}>Load an example</button>
				</div>
				<div class="input-surface">
					<div class="field-row">
						<label for="language">Language</label>
						<div class="select-wrap">
							<select
								id="language"
								bind:value={language}
								disabled={analysisState.status === 'running'}
								>{#each languages as item}<option value={item.value}>{item.label}</option
									>{/each}</select
							>
							<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"></path></svg>
						</div>
					</div>
					<div class="code-field">
						<div class="code-label-row">
							<label for="algorithm-code">Code</label><span aria-live="polite"
								>{code.length.toLocaleString()} characters</span
							>
						</div>
						<textarea
							id="algorithm-code"
							bind:value={code}
							onkeydown={handleEditorKeydown}
							placeholder="Paste your algorithm here"
							spellcheck="false"
							disabled={analysisState.status === 'running'}
						></textarea>
					</div>
					<div class="submit-row">
						<button
							class="primary-button"
							type="button"
							onclick={runAnalysis}
							disabled={!code.trim() || analysisState.status === 'running'}
						>
							{analysisState.status === 'running'
								? 'Analysing…'
								: resultIsStale
									? 'Run updated analysis'
									: 'Run analysis'}
						</button>
					</div>
				</div>

				<div class="input-meta" role="status" aria-live="polite">
					{#if analysisState.status === 'running'}
						<strong>{analysisState.recovered ? 'Reconnected to analysis.' : 'Analysing…'}</strong>
					{:else if analysisState.status === 'error'}
						<strong class="status-error">Analysis needs attention.</strong>
					{:else if resultIsStale}
						<strong class="status-warning">Result is out of date.</strong>
					{:else if analysisState.status === 'complete'}
						<strong class="status-success">Analysis complete.</strong>
					{/if}
					<span>Code is sent to Cloudflare Workers AI.</span>
				</div>
			</div>

			<div class="result-column" aria-live="polite" aria-busy={analysisState.status === 'running'}>
				<header class="result-heading">
					<h2>Your worked explanation</h2>
					{#if analysisState.status === 'complete'}
						<button class="text-button" type="button" onclick={clearResult}>Analyse another</button>
					{/if}
				</header>

				{#if analysisState.status === 'idle'}
					<div class="empty-state">
						<p>Explanation, complexity, and improvements will appear here.</p>
					</div>
				{:else if analysisState.status === 'running'}
					<div class="running-state">
						<div class="running-heading">
							<span class="spinner" aria-hidden="true"></span>
							<div>
								<h3>
									{analysisState.recovered
										? 'Rejoining your analysis'
										: 'Preparing your worked explanation'}
								</h3>
								<p>
									{analysisState.recovered
										? 'The original request is still running. We are waiting for its result.'
										: `Reviewing your ${selectedLanguage} submission. This can take a moment.`}
								</p>
							</div>
						</div>
					</div>
				{:else if analysisState.status === 'error'}
					<div class="error-state" role="alert">
						<svg viewBox="0 0 24 24" aria-hidden="true"
							><path d="M12 8v5M12 17h.01"></path><circle cx="12" cy="12" r="9"></circle></svg
						>
						<div>
							<h3>We couldn’t complete the analysis</h3>
							<p>{analysisState.error}</p>
							<div class="error-actions">
								<button class="secondary-button" type="button" onclick={runAnalysis}
									>Try again</button
								><button class="text-button" type="button" onclick={clearResult}>Dismiss</button>
							</div>
						</div>
					</div>
				{:else if analysisState.status === 'complete' && analysisState.result}
					{@const result = analysisState.result}
					<article class="worked-solution">
						{#if resultIsStale}<div class="stale-notice" role="status">
								<strong>Your code has changed.</strong><span
									>This explanation still belongs to the submitted version shown above.</span
								>
							</div>{/if}
						<section class="result-section">
							<h3>What it does</h3>
							<p>{result.explanation}</p>
						</section>
						<section class="result-section">
							<h3>Complexity</h3>
							<div class="complexity-card">
								<div class="complexity-values">
									<div><span>Time</span><strong>{result.complexity.time}</strong></div>
									<div><span>Space</span><strong>{result.complexity.space}</strong></div>
								</div>
								<p>{result.complexity.explanation}</p>
							</div>
						</section>
						<section class="result-section improvements-section">
							<h3>Ways to improve it</h3>
							{#if result.improvements.length}<ol>
									{#each result.improvements as improvement}<li>{improvement}</li>{/each}
								</ol>{:else}<p>No specific improvements were returned for this analysis.</p>{/if}
						</section>
					</article>
				{/if}
			</div>
		</section>
	</main>
</div>
