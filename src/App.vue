<template>
  <div id="app">
    <MainMenu 
        @selected-tool="selectedTool = $event"
        :selected-tool="selectedTool"
        :menu="defaultMenu"
    />
    <PropertiesMenu
        @update-properties="onUpdatePropertiesForShape"
        @export-png="exportPNG"
    />
    <ContextMenu 
        :contextMenu="contextMenu"
        @close-context-menu="contextMenu.visible = false"
    />
    <Canvas 
        :selectedTool="selectedTool"
        :saveCanvas="saveCanvas"
        :updatePropertiesForShape="updateShapeProperties"
        @select-tool="selectTool"
        @mouse-up="resetSelectedTool"
        @context-menu="handleContextMenu($event)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import MainMenu from '@/components/mainMenu/MainMenu.vue';
import Canvas from '@/components/canvas/Canvas.vue';
import { Tool } from './store/toolbar/types';
import { ContextMenuProperties, Coords, DefaultMenu, Dictionary } from './Types/types';
import ContextMenu from '@/components/contextMenu/ContextMenu.vue';
import PropertiesMenu from '@/components/propertiesMenu/PropertiesMenu.vue';


@Component({
    components: {
        Canvas,
        MainMenu,
        ContextMenu,
        PropertiesMenu,
    }
})
export default class App extends Vue {
    public defaultMenu: Dictionary<DefaultMenu> = {
        SELECT: {
            label: 'SELECT',
            icon: require('@/assets/icons/select.svg'),
            selected: true,
            disabled: false
        },
        RECTANGLE: {
            label: 'RECTANGLE',
            icon: require('@/assets/icons/rectangle.svg'),
            selected: false,
            disabled: false
        },
        CIRCLE: {
            label: 'CIRCLE',
            icon: require('@/assets/icons/circle.svg'),
            selected: false,
            disabled: false
        },
        LINE: {
            label: 'LINE',
            icon: require('@/assets/icons/line.svg'),
            selected: false,
            disabled: false
        },
        PAN: {
            label: 'PAN',
            icon: require('@/assets/icons/pan.svg'),
            selected: false,
            disabled: true
        }
    };
    public shouldUpdatePropertiesForShape = false;
    public saveCanvas = false;
    public selectedTool: Tool = 'SELECT';
    public contextMenu: ContextMenuProperties= {
        visible: false,
        coords: {
            x: 0,
            y: 0,
        }
    }

    public get updateShapeProperties() {
        console.log(this.shouldUpdatePropertiesForShape);
        return this.shouldUpdatePropertiesForShape;
    }

    public onUpdatePropertiesForShape() {
        this.shouldUpdatePropertiesForShape = true;
        console.log('here');
        setTimeout(() => this.shouldUpdatePropertiesForShape = false, 500)
    }

    public resetSelectedTool(): void {
        if(this.selectedTool !== 'PAN') {
            this.selectedTool = 'SELECT';
        }
    }

    public selectTool(tool: Tool): void {
        if(!this.defaultMenu[tool].disabled) {
            this.selectedTool = tool;
        }
    }

    public handleContextMenu(contextMenuEvent: {visible: boolean, mouseCoords: Coords}): void {
        this.contextMenu.visible = contextMenuEvent.visible;
        this.contextMenu.coords = contextMenuEvent.mouseCoords;
    }

    public exportPNG() {
        this.saveCanvas = true;
    }
}
</script>

<style lang="scss">
@import './style/main.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
