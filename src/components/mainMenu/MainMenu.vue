<template>
    <div class="toolbar-container">
      <nav ref="toolbar" v-if="storeReady" class="tb">
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
                        :title="tool.shortcut"
                    >
                        <img :src="getIcon(tool.icon)" :alt="tool.label" class="toolbar-icon">
                    </button>
                </li>
            </ul>
        </nav>
        <ul class="tb mt-3 layers" style="width: 100px; min-height: 100px; max-height: 500px; overflow-y: scroll;" v-if="getShapes">
           <li 
                v-for="shape in getShapes" 
                :key="shape.id" 
                class="layer"
                :class="{
                    'selected-layer': shape.id === selectedShapeId
                }"
                style="padding: 0.5rem;"
           >
                {{shape.type}}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Tool, ToolbarStore } from '@/store/toolbar/types';
import { Dictionary } from '@/Types/types';
import { Vue, Component } from "vue-property-decorator";
import {
  State,
  namespace,
} from 'vuex-class';
import { Shape } from '../canvas/shape';

const toolbar = namespace('toolbar');
const canvas = namespace('canvas');
const properties = namespace('properties');

@Component
export default class MainMenu extends Vue {
    @State('toolbar') public toolbarStore!: ToolbarStore;
    @toolbar.Getter('getActiveTool') getActiveTool!: Tool;
    @canvas.Getter('getShapes') getShapes!: Dictionary<Shape>;
    @properties.Getter('getId') selectedShapeId!: string;
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