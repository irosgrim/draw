<template>
  <div id="app">
    <MainMenu 
        @selected-tool="selectedTool = $event" 
        :selected-tool="selectedTool"
    />
    <Canvas 
        :selectedTool="selectedTool"
        @mouse-up="resetSelectedTool"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MainMenu from '@/components/mainMenu/MainMenu.vue';
import Canvas from '@/components/canvas/Canvas.vue';
import { Tool } from './store/toolbar/types';


@Component({
    components: {
        Canvas,
        MainMenu
    }
})
export default class App extends Vue {
    public selectedTool: Tool = 'SELECT';

    public resetSelectedTool() {
        this.selectedTool = 'SELECT';
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
