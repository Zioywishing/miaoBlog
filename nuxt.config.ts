// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
	devtools: { enabled: false },
	alias: {
		"@": "/"
	},
	app: {
		pageTransition: {
			name: 'page',
			mode: 'out-in'
		}
	},
	vite: {
		server: {},
		plugins: [],
	},
	modules: ["@pinia/nuxt", '@element-plus/nuxt'],
	compatibilityDate: "2025-01-12",
	nitro: {
		compressPublicAssets: true,
	},
	experimental: { appManifest: false },
});
