<template>
  <div id="app">
    <MainMenu/>
    <PropertiesMenu @export-png="exportPNG"/>
    <ContextMenu/>
    <Canvas 
        :saveCanvas="saveCanvas"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MainMenu from '@/components/mainMenu/MainMenu.vue';
import Canvas from '@/components/canvas/Canvas.vue';
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
    public saveCanvas = false;

    public exportPNG() {
        this.saveCanvas = true;
    }
}
</script>

<style lang="scss">
@import './style/main.scss';
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
