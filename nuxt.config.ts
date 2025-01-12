import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
								devtools: { enabled: true },
								alias: {
																"@": "/"
								},
								vite: {
																server: {},
																plugins: [
																								AutoImport({
																																imports: [
																																								{
																																																"naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"]
																																								}
																																]
																								}),
																								Components({
																																resolvers: [NaiveUiResolver()]
																								})
																]
								},
								modules: ["nuxtjs-naive-ui", "@pinia/nuxt"],
								compatibilityDate: "2025-01-12"
});
