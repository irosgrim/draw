<template>
    <div 
        v-if="contextMenu.visible"
        :style="{ 
                transform: `translate(${contextMenu.coords.x}px, ${contextMenu.coords.y}px)` 
            }" 
        class="context-menu"
        v-click-outside="onClickOutside"
    > 
        Context menu 
    </div>
</template>

<script lang="ts">
import { ContextMenuProperties } from '@/Types/types';
import { Vue, Component, Prop} from 'vue-property-decorator';

@Component
export default class ContextMenu extends Vue {
    @Prop({default: () => {
        return {
            visible: false,
            coords: {
                x: 0,
                y: 0
            }
        }
    }}) public contextMenu!: ContextMenuProperties;

    public onClickOutside(): void {
        console.log('close');
        this.$emit('close-context-menu');
    }
}
</script>