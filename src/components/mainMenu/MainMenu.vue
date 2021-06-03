<template>
    <nav class="toolbar-container" ref="toolbar" v-if="storeReady">
      <ul class="toolbar">
            <li>
                <button type="button" ref="dragBtn">...</button>
            </li>
            <li v-for="tool of toolbarStore.tools" :key="tool.label">
                <button 
                    type="button" 
                    @click="$store.commit('toolbar/setActiveTool', tool.label)"
                    :class="{selected: getActiveTool === tool.label, disabled: tool.disabled}"
                    :disabled="tool.disabled"
                >
                    <img :src="getIcon(tool.icon)" :alt="tool.label" class="toolbar-icon">
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { Tool, ToolbarStore } from '@/store/toolbar/types';
import { Vue, Component } from "vue-property-decorator";
import {
  State,
  namespace,
  Getter
} from 'vuex-class';

const toolbar = namespace('toolbar');

@Component
export default class MainMenu extends Vue {
    @State('toolbar') public toolbarStore!: ToolbarStore;
    @toolbar.Getter('getActiveTool') getActiveTool!: Tool;
    public storeReady = false;

    private mounted() {
        if(this.toolbarStore) {
            this.storeReady = true;
        }
    }

    public getIcon(iconName: string): string {
        return require('@/assets/icons/' + iconName);
    }

}
</script>