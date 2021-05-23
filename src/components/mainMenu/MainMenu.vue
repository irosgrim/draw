<template>
    <nav class="toolbar-container">
      <ul class="toolbar">
            <li>
                <button>...</button>
            </li>
            <li v-for="menuItem of menu.defaultMenu" :key="menuItem.label">
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
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
interface DefaultMenu {
    label: string;
    icon: string;
    selected: boolean;
}

interface Dictionary<T> {
    [key: string] : T;
}

type Tool = 'select' | 'rectangle' | 'circle';
class Menu {
    constructor(public defaultMenu: Dictionary<DefaultMenu>) {
    }
    public setActiveTool(tool: Tool) {
        this.resetMenu();
        this.defaultMenu[tool].selected = true;
    }
    private resetMenu() {
        for(const t in this.defaultMenu) {
            this.defaultMenu[t].selected = false;
        }
    }
}


@Component
export default class MainMenu extends Vue {
    @Prop() selectedTool!: Tool;
    public defaultMenu: Dictionary<DefaultMenu> = {
        select: {
            label: 'select',
            icon: require('@/assets/icons/select.svg'),
            selected: true
        },
        rectangle: {
            label: 'rectangle',
            icon: require('@/assets/icons/rectangle.svg'),
            selected: false
        },
        circle: {
            label: 'circle',
            icon: require('@/assets/icons/circle.svg'),
            selected: false
        }
    };
    public menu: Menu | null = null;

    created() {
        this.menu = new Menu(this.defaultMenu);
    }

    @Watch('selectedTool')
    private onSelectedToolChange(tool: Tool) {
        this.menu!.setActiveTool(tool);
    }
}
</script>