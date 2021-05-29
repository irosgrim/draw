<template>
    <ul class="properties-menu">
        <li class="opacity-75" v-if="getCurrentShape">
            <div class="d-flex">
                <div class="w-50">x: {{ getCurrentShape.x }}</div>
                <div class="flex-grow-1">y: {{ getCurrentShape.y }}</div>
            </div>
            <div class="d-flex">
                <div class="w-50">w: {{ getCurrentShape.width }}</div>
                <div class="flex-grow-1">h: {{ getCurrentShape.height }}</div>
            </div>
        </li>
        <li v-if="getCurrentShape">
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
                    :opacity="stroke.opacity"
                    @color-changed="handleColorChanged($event, 'STROKE')"
                    @opacity-changed="handleOpacityChanged($event, 'STROKE')"
                />
            </div>
        </li>
        <li v-if="getCurrentShape">
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
                    :color="getFill.color"
                    :opacity="getFill.opacity"
                    @color-changed="handleColorChanged($event, 'FILL')"
                    @opacity-changed="handleOpacityChanged($event, 'FILL')"
                />

            </div>
        </li>
        <li>
             <div class="property">
                <div class="bold">Canvas background</div>
            </div>
            <div class="property-container">
                <ColorPicker 
                    :color="getCanvas.color"
                    :opacity="getCanvas.opacity"
                    @color-changed="handleColorChanged($event, 'CANVAS')"
                    @opacity-changed="handleOpacityChanged($event, 'CANVAS')"
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
  Getter,
  namespace
} from 'vuex-class'
import { Properties, Stroke } from '@/Types/types';
import { Color, PropertiesStore } from '@/store/properties/types';
import { Shape } from '../canvas/canvas';

const properties = namespace('properties');

@Component({
    components: {
        ColorPicker,
    }
})
export default class PropertiesMenu extends Vue {
    @State('properties') public properties!: PropertiesStore;
    @properties.Getter('getCurrentShape') public getCurrentShape!: Shape;
    @properties.Getter('getStroke') public getStroke!: Stroke;
    @properties.Getter('getFill') public getFill!: Color;
    @properties.Getter('getCanvas') public getCanvas!: Color;

    public stroke = {
        showProperties: false,
        color: '#ffc0cb',
        opacity: '32'
    }
    public fill = {
        showProperties: false,
        color: '#ffc0cb',
        opacity: '59'
    }
    public canvas = {
        showProperties: true,
        color: '#ffffff',
        opacity: '56'
    }

    public toggleStroke() {
        this.stroke.showProperties = !this.stroke.showProperties;
    }

    public toggleFill() {
        this.fill.showProperties = !this.fill.showProperties;
    }

    public handleColorChanged(color: Properties, property: string) {
        switch(property) {
            case 'STROKE':
                this.stroke.color = color;
                this.$store.commit('properties/setStroke', {style: color, width: 1})
                break;
            case 'FILL':
                this.fill.color = color;
                this.$store.commit('properties/setFill', {color: color, opacity: this.fill.opacity})
                break;
            case 'CANVAS':
                this.canvas.color = color;
                this.$store.commit('properties/setCanvas', {color: color, opacity: this.canvas.opacity})
                break
        }
    }

    public handleOpacityChanged(opacity: Properties, property: string) {
        console.log(opacity);
        switch(property) {
            case 'STROKE':
                this.stroke.opacity = opacity;
                this.$store.commit('properties/setStroke', {style: this.stroke.color, width: 1})
                break;
            case 'FILL':
                this.fill.opacity = opacity;
                this.$store.commit('properties/setFill', {color: this.fill.color, opacity: opacity})
                break;
            case 'CANVAS':
                this.canvas.opacity = opacity;
                this.$store.commit('properties/setCanvas', {color: this.canvas.color, opacity: opacity})
                break
        }
    }
}
</script>