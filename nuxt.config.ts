// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
	devtools: { enabled: false },
	alias: {
		"@": "/"
		// 'dayjs': 'dayjs/esm/'
	},
	app: {
		pageTransition: {
			name: 'page',
			mode: 'out-in'
		}
	},
	vite: {
		server: {},
		plugins: [
			// AutoImport({
			// 	resolvers: [ElementPlusResolver()],
			// }),
			// Components({
			// 	resolvers: [ElementPlusResolver()],
			// })
		],
		test: {
			deps: {
				inline: ['element-plus']
			}
		},
	},
	modules: ["@pinia/nuxt", '@element-plus/nuxt'],
	compatibilityDate: "2025-01-12",
	build: {
		analyze: {
			filename: "stats.html",
		},
	},
	nitro: {
		compressPublicAssets: true,
	},
	experimental: { appManifest: false },
});
