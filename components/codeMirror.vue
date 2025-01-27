<template>
    <div class="cm-rander-wrapper">
        <div class="cm-header">
            <div class="cm-header-title">
                <span>CodeMirror</span>
            </div>
            <div class="cm-header-controls">
                <div class="cm-switch-show-hide" @click="show = !show">
                    {{ show ? '收起' : '展开' }}
                </div>
            </div>
        </div>
        <miao-collapse :show="show" style="overflow: hidden;">
            <div ref="cmRootRef"></div>
            <el-skeleton v-if="isLoading === true" :rows="rows" style="display: flex;flex-direction: column;" />
        </miao-collapse>
    </div>
</template>

<script setup lang="ts">
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
// import chevronDown from "./icons/chevronDown.vue";
// import {javascript} from "@codemirror/lang-javascript"

const props = defineProps<{
    data: string,
    type?: string,
}>()

const show = ref(true)
const cmRootRef = ref<HTMLElement>()

const isLoading = ref(true)

const rows = computed(() => {
    if (!props.data) {
        return 5
    }
    const lines = props.data.split('\n')
    console.log({
        L: lines.length,
    })
    return lines.length - 2 > 0 ? lines.length - 2 : 1
})

const useLangExtensions = async () => {
   const ext = props.type
   switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
         const { javascript } = await import('@codemirror/lang-javascript')
         return [
            javascript({
               jsx: ext.substring(2, 3) === 'x',
               typescript: ext.substring(0, 2) === 'js'
            })
         ]
         break
      case 'css':
      case 'scss':
         const { sass } = await import('@codemirror/lang-sass')
         return [sass()]
         break
      case 'html':
         const { html } = await import('@codemirror/lang-html')
         return [html()]
         break
      case 'py':
         const { python } = await import('@codemirror/lang-python')
         return [python()]
         break
      case 'go':
         const { go } = await import('@codemirror/lang-go')
         return [go()]
         break
      case 'json':
         const { json } = await import('@codemirror/lang-json')
         return [json()]
         break
      case 'md':
         const { markdown } = await import('@codemirror/lang-markdown')
         return [markdown()]
         break
      case 'yaml':
         const { yaml } = await import('@codemirror/lang-yaml')
         return [yaml()]
         break
      case 'vue':
         const { vue } = await import('@codemirror/lang-vue')
         return [vue()]
         break
      case 'xml':
         const { xml } = await import('@codemirror/lang-xml')
         return [xml()]
         break
      default:
         return []
   }
}

let cm: EditorView

onMounted(async () => {
    const langExtensions = await useLangExtensions()
    cm = new EditorView({
        parent: cmRootRef.value,
        doc: props.data,
        extensions: [
            basicSetup,
            EditorState.readOnly.of(true),
            ...langExtensions
        ],
    })
    isLoading.value = false
})

onUpdated(() => {
    cm.dispatch({
        changes: {
            from: 0,
            to: cm.state.doc.length,
            insert: props.data,
        },
    })
})

onBeforeUnmount(() => {
    cm.destroy()
})

</script>

<style lang="scss">
.cm-rander-wrapper {
    .cm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        height: 25px;
        background-color: #000;
        color: #fff;
        border-radius: 10px 10px 0 0;
        user-select: none;

        .cm-header-controls {
            .cm-switch-show-hide {
                cursor: pointer;
                color: #fff;
                fill: #fff;
            }
        }
    }
}
</style>