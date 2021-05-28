<template>
    <ul class="properties-menu">
        <li>
            <div class="property">
                <div class="bold">Stroke</div>
                <div>
                    <button type="button" @click="toggleStroke">
                        {{ showStrokeProperty ? '-' : '+'}}
                    </button>
                </div>
            </div>
            <div class="property-container" v-if="showStrokeProperty">
                <ColorPicker />
            </div>
        </li>
        <li>
            <div class="property">
                <div class="bold">Fill</div>
                <div>
                    <button type="button" @click="toggleFill"> {{ showFillProperty ? '-' : '+'}}</button>
                </div>
            </div>
            <div class="property-container" v-if="showFillProperty">
                <ColorPicker />

            </div>
        </li>
        <li>
             <div class="property">
                <div class="bold">Canvas background</div>
            </div>
            <div class="property-container">
                <ColorPicker />
            </div>
        </li>
    </ul>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ColorPicker from '@/components/colorPicker/ColorPicker.vue';

@Component({
    components: {
        ColorPicker,
    }
})
export default class PropertiesMenu extends Vue {
    public showStrokeProperty = false;
    public showFillProperty = false;


    public toggleStroke() {
        this.showStrokeProperty = !this.showStrokeProperty;
    }

    public toggleFill() {
        this.showFillProperty = !this.showFillProperty;
    }

}
</script>