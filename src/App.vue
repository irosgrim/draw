<template>
  <div id="app">
    <MainMenu 
        @selected-tool="selectedTool = $event" 
        :selected-tool="selectedTool"
        :menu="defaultMenu"
    />
    <Canvas 
        :selectedTool="selectedTool"
        @select-tool="selectTool"
        @mouse-up="resetSelectedTool"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MainMenu from '@/components/mainMenu/MainMenu.vue';
import Canvas from '@/components/canvas/Canvas.vue';
import { Tool } from './store/toolbar/types';
import { DefaultMenu, Dictionary } from './Types/types';


@Component({
    components: {
        Canvas,
        MainMenu
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
        PAN: {
            label: 'PAN',
            icon: require('@/assets/icons/pan.svg'),
            selected: false,
            disabled: true
        }
    };
    public selectedTool: Tool = 'SELECT';

    public resetSelectedTool() {
        if(this.selectedTool !== 'PAN') {
            this.selectedTool = 'SELECT';
        }
    }

    public selectTool(tool: Tool) {
        if(!this.defaultMenu[tool].disabled) {
            this.selectedTool = tool;
        }
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
