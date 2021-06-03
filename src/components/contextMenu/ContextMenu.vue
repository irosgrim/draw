<template>
    <div 
        v-if="getContextMenu && getContextMenu.visible"
        :style="{ 
                transform: `translate(${getContextMenu.x}px, ${getContextMenu.y}px)` 
            }" 
        class="context-menu"
        v-click-outside="onClickOutside"
    > 
        Context menu 
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop} from 'vue-property-decorator';
import { ContextMenu as ContextMenuProperties } from '@/store/toolbar/types';
import { namespace } from 'vuex-class';
const toolbar = namespace('toolbar');

const defaultProps = {
            visible: false,
            x: 0,
            y: 0,
        }
@Component
export default class ContextMenu extends Vue {
    @toolbar.Getter('getContextMenu') public getContextMenu!: ContextMenuProperties;

    public onClickOutside(): void {
        this.$store.commit('toolbar/showContextMenu', defaultProps)
    }
}
</script>