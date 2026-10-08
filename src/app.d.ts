/// <reference path="../worker-configuration.d.ts" />

import type { CloudflareEnv } from '$lib/server/env';

declare global {
	interface Env extends CloudflareEnv {}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf: IncomingRequestCfProperties;
		}
	}
}

export {};
