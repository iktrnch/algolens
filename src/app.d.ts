/// <reference path="../worker-configuration.d.ts" />

import type { CloudflareEnv } from '#lib/server/env.js';

declare global {
	interface Env extends CloudflareEnv {}
	namespace Cloudflare {
		interface Env extends CloudflareEnv {}
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
