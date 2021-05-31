<template>
    <nav class="toolbar-container" ref="toolbar">
      <ul class="toolbar">
            <li>
                <button type="button" ref="dragBtn">...</button>
            </li>
            <li v-for="menuItem of menu" :key="menuItem.label">
                <button 
                    type="button" 
                    @click="$emit('selected-tool', menuItem.label)"
                    :class="{selected: menuItem.selected, disabled: menuItem.disabled}"
                    :disabled="menuItem.disabled"
                >
                    <img :src="menuItem.icon" :alt="menuItem.label">
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { Tool } from '@/store/toolbar/types';
import { DefaultMenu, Dictionary } from '@/Types/types';
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class MainMenu extends Vue {
    @Prop() selectedTool!: Tool;
    @Prop() menu!: Dictionary<DefaultMenu>;

    @Watch('selectedTool')
    private onSelectedToolChange(tool: Tool) {
        this.setActiveTool(tool);
    }

    public setActiveTool(tool: Tool) {
        this.resetMenu();
        this.menu[tool].selected = true;
        
    }

    private resetMenu() {
        for(const tool in this.menu) {
            this.menu[tool].selected = false;
        }
    }
}
</script>