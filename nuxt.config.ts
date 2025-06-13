// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import mkcert from "vite-plugin-mkcert";
import tailwindcss from '@tailwindcss/vite'


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
		},
		head: {
			script: [
				{
					async: true,
					src: 'https://www.googletagmanager.com/gtag/js?id=G-X0E57834WZ'
				},
				{
					children: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-X0E57834WZ');
					`
				}
			]
		}
	},
	vite: {
		server: {
			https: true,
		},
		plugins: [mkcert(), tailwindcss()],
	},
	modules: ["@pinia/nuxt", '@element-plus/nuxt'],
	compatibilityDate: "2025-01-12",
	nitro: {
		compressPublicAssets: true,
	},
	experimental: { appManifest: false },
	// 添加SSR配置，确保服务端渲染
	ssr: true,
	// 数据获取策略配置
	routeRules: {
		'/posts': { swr: 600 }, // 缓存10分钟，同时在后台重新验证
	}
});
