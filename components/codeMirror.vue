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
        </miao-collapse>
    </div>
</template>

<script setup lang="ts">
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
// import chevronDown from "./icons/chevronDown.vue";
// import {javascript} from "@codemirror/lang-javascript"

const props = defineProps<{
    data: string
}>()

const show = ref(true)
const cmRootRef = ref<HTMLElement>()

onMounted(() => {
    if (!cmRootRef.value) {
        return
    }
    new EditorView({
        parent: cmRootRef.value,
        doc: props.data,
        extensions: [
            basicSetup,
            EditorState.readOnly.of(true),
        ],
    })
})

</script>

<style lang="scss" scoped>
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