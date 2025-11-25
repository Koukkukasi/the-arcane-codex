
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/battle" | "/character" | "/character/create" | "/lobby" | "/scenario";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/battle": Record<string, never>;
			"/character": Record<string, never>;
			"/character/create": Record<string, never>;
			"/lobby": Record<string, never>;
			"/scenario": Record<string, never>
		};
		Pathname(): "/" | "/battle" | "/battle/" | "/character" | "/character/" | "/character/create" | "/character/create/" | "/lobby" | "/lobby/" | "/scenario" | "/scenario/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}