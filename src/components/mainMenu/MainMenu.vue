<template>
    <nav class="toolbar-container" ref="toolbar">
      <ul class="toolbar">
            <li>
                <button type="button" ref="dragBtn">...</button>
            </li>
            <li v-for="menuItem of defaultMenu" :key="menuItem.label">
                <button 
                    type="button" 
                    @click="$emit('selected-tool', menuItem.label)"
                    :class="{selected: menuItem.selected}"
                >
                    <img :src="menuItem.icon" :alt="menuItem.label">
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { Tool } from '@/store/toolbar/types';
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
interface DefaultMenu {
    label: string;
    icon: string;
    selected: boolean;
}

interface Dictionary<T> {
    [key: string] : T;
}

@Component
export default class MainMenu extends Vue {
    @Prop() selectedTool!: Tool;
    public defaultMenu: Dictionary<DefaultMenu> = {
        SELECT: {
            label: 'SELECT',
            icon: require('@/assets/icons/select.svg'),
            selected: true
        },
        RECTANGLE: {
            label: 'RECTANGLE',
            icon: require('@/assets/icons/rectangle.svg'),
            selected: false
        },
        CIRCLE: {
            label: 'CIRCLE',
            icon: require('@/assets/icons/circle.svg'),
            selected: false
        }
    };

    @Watch('selectedTool')
    private onSelectedToolChange(tool: Tool) {
        this.setActiveTool(tool);
    }

    public setActiveTool(tool: Tool) {
        this.resetMenu();
        this.defaultMenu[tool].selected = true;
    }

    private resetMenu() {
        for(const tool in this.defaultMenu) {
            this.defaultMenu[tool].selected = false;
        }
    }
}
</script>