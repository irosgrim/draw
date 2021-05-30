<template>
    <ul class="properties-menu">
        <li class="opacity-75" v-if="getId">
            <div class="d-flex">
                <div class="w-50">x: {{ getX }}</div>
                <div class="flex-grow-1">y: {{ getY }}</div>
            </div>
            <div class="d-flex">
                <div class="w-50">w: {{ getWidth }}</div>
                <div class="flex-grow-1">h: {{ getHeight }}</div>
            </div>
        </li>
        <li v-if="getId">
            <div class="property">
                <div class="bold">Stroke</div>
                <div>
                    <button type="button" @click="toggleStroke" class="property-toggle-btn">
                        {{ stroke.showProperties ? '-' : '+'}}
                    </button>
                </div>
            </div>
            <div class="property-container" v-if="stroke.showProperties">
                <ColorPicker 
                    :color="getStroke ? getStroke.style : stroke.color"
                    @color-changed="handleColorChanged($event, 'STROKE')"
                />
            </div>
        </li>
        <li v-if="getId">
            <div class="property">
                <div class="bold">Fill</div>
                <div>
                    <button type="button" @click="toggleFill" class="property-toggle-btn"> 
                        {{ fill.showProperties ? '-' : '+'}}
                    </button>
                </div>
            </div>
            <div class="property-container" v-if="fill.showProperties">
                <ColorPicker
                    :color="getFill"
                    @color-changed="handleColorChanged($event, 'FILL')"
                />

            </div>
        </li>
        <li>
             <div class="property">
                <div class="bold">Canvas background</div>
            </div>
            <div class="property-container">
                <ColorPicker 
                    :color="getCanvas"
                    @color-changed="handleColorChanged($event, 'CANVAS')"
                />
            </div>
        </li>
        <li>
            <div class="property">
                <div class="bold">Export</div>
                <div>
                    <button type="button" @click="$emit('export-png')" class="property-toggle-btn"> 
                        ...
                    </button>
                </div>
            </div>
        </li>
    </ul>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ColorPicker from '@/components/colorPicker/ColorPicker.vue';
import {
  State,
  namespace
} from 'vuex-class'
import { Properties, Stroke } from '@/Types/types';
import { PropertiesStore } from '@/store/properties/types';

const properties = namespace('properties');

@Component({
    components: {
        ColorPicker,
    }
})
export default class PropertiesMenu extends Vue {
    @State('properties') public properties!: PropertiesStore;
    @properties.Getter('getId') public getId!: number;
    @properties.Getter('getX') public getX!: number;
    @properties.Getter('getY') public getY!: number;
    @properties.Getter('getWidth') public getWidth!: number;
    @properties.Getter('getHeight') public getHeight!: number;
    @properties.Getter('getStroke') public getStroke!: Stroke;
    @properties.Getter('getFill') public getFill!: string;
    @properties.Getter('getCanvas') public getCanvas!: string;

    public stroke = {
        showProperties: false,
        color: 'rgba(255, 192, 203, 1)',
    }
    public fill = {
        showProperties: false,
        color: 'rgba(255, 192, 203, 1)',
    }
    public canvas = {
        showProperties: true,
        color: 'rgba(255, 255, 255, 1)',
    }

    public toggleStroke() {
        this.stroke.showProperties = !this.stroke.showProperties;
    }

    public toggleFill() {
        this.fill.showProperties = !this.fill.showProperties;
    }

    public handleColorChanged(color: string, property: Properties) {
        switch(property) {
            case 'STROKE':
                this.stroke.color = color;
                this.$store.commit('properties/setStroke', {style: color, width: 1})
                break;
            case 'FILL':
                this.fill.color = color;
                this.$store.commit('properties/setFill', color)
                break;
            case 'CANVAS':
                this.canvas.color = color;
                this.$store.commit('properties/setCanvas', color)
                break
        }
    }
}
</script>