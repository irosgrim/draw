<template>
    <nav class="toolbar-container">
      <ul class="toolbar">
        <li>
          <button type="button" @click="$emit('selected-tool', 'select')">
                <img src="@/assets/icons/select.svg" alt="" style="margin-left: -0.25rem;">
                </button>
            </li>
            <li>
                <button type="button" @click="$emit('selected-tool', 'rectangle')">
                    <img src="@/assets/icons/rectangle.svg" alt="">
                </button>
            </li>
            <li>
                <button type="button"  @click="$emit('selected-tool', 'circle')">
                    <img src="@/assets/icons/circle.svg" alt="">
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MainMenu extends Vue {

}
</script>