<template>
  <div id="app">
    <MainMenu />
    <Canvas />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MainMenu from '@/components/mainMenu/MainMenu.vue';
import Canvas from '@/components/canvas/Canvas.vue';


@Component({
    components: {
        Canvas,
        MainMenu
    }
})
export default class App extends Vue {}
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
