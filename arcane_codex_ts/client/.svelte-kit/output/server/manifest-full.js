export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BNajF2jx.js",app:"_app/immutable/entry/app.BPytEhmv.js",imports:["_app/immutable/entry/start.BNajF2jx.js","_app/immutable/chunks/BkSTpIo0.js","_app/immutable/chunks/BXw_DALN.js","_app/immutable/chunks/CdyUXxNf.js","_app/immutable/chunks/DdSxMtKz.js","_app/immutable/entry/app.BPytEhmv.js","_app/immutable/chunks/ysmZaXG2.js","_app/immutable/chunks/BXw_DALN.js","_app/immutable/chunks/Dh7Jo7ds.js","_app/immutable/chunks/DgWjOOEg.js","_app/immutable/chunks/DmY1WVrf.js","_app/immutable/chunks/DdSxMtKz.js","_app/immutable/chunks/Cc4t3Kl8.js","_app/immutable/chunks/BaIPS2ST.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/battle",
				pattern: /^\/battle\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/character/create",
				pattern: /^\/character\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/lobby",
				pattern: /^\/lobby\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/scenario",
				pattern: /^\/scenario\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
