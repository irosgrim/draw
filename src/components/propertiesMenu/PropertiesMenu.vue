<template>
    <ul class="properties-menu">
        <li class="properties-menu-item">
            <div class="bold">Align</div>
            <ul class="align-menu disabled">
                <li class="align-menu-item">
                    <button>
                        <img src="@/assets/icons/align_left.svg" alt="align bottom" width="16" height="16">
                    </button>
                </li>
                <li class="align-menu-item">
                    <button>
                        <img src="@/assets/icons/align_top.svg" alt="align top" width="16" height="16">
                    </button>
                </li>
                <li class="align-menu-item">
                    <button>
                        <img src="@/assets/icons/align_bottom.svg" alt="align bottom" width="16" height="16">
                    </button>
                </li>
                <li class="align-menu-item">
                    <button>
                        <img src="@/assets/icons/align_right.svg" alt="align bottom" width="16" height="16">
                    </button>
                </li>
                
            </ul>
        </li>
        <li class="opacity-75 properties-menu-item" v-if="getId">
            <div class="d-flex mb-2">
                <div class="d-flex align-items-center">
                    <label for="X" class="bold">X </label>
                    <input
                        class="property-input property-input-s"
                        :value="getShapeProperties.x" 
                        type="number" 
                        name="X" 
                        id="X"
                        @keyup.enter="updateProperty('x', $event.target.value)"
                    >
                </div>
                <div class="d-flex align-items-center">
                    <label for="Y" class="bold">Y </label>
                    <input 
                        class="property-input property-input-s"
                        :value="getShapeProperties.y" 
                        type="number" 
                        name="Y" 
                        id="Y"
                        @keyup.enter="updateProperty('y', $event.target.value)"
                    >
                </div>
            </div>
            <div class="d-flex">
                <div class="d-flex align-items-center">
                    <label for="width" class="bold">W </label>
                    <input 
                        class="property-input property-input-s"
                        :value="getShapeProperties.width" 
                        type="number" 
                        name="width" 
                        id="width"
                        @keyup.enter="updateProperty('width', $event.target.value)"
                    >
                </div>
                <div class="d-flex align-items-center">
                    <label for="height" class="bold">H </label>
                    <input 
                        class="property-input property-input-s"
                        :value="getShapeProperties.height" 
                        type="number" 
                        name="height" 
                        id="height"
                        @keyup.enter="updateProperty('height', $event.target.value)"
                    >
                </div>
            </div>
            <div class="mt-3">
                <label for="rotation" class="bold">Rotation</label>
                <input 
                    class="property-input property-input-xs"
                    :value="getShapeProperties.rotation"
                    type="number" 
                    name="rotation"
                    id="rotation"
                    @keyup.enter="updateProperty('rotation', $event.target.value)"
                />
            </div>
            <div v-if="getRadius">
                <div class="bold">Radius:</div>
                <div class="property-container">
                    <div class="w-50">
                        <div class="mb-2 d-flex">
                            <input 
                                class="property-input property-input-xs"
                                type="number" 
                                name="radiusNW"
                                :value="getRadius.NW"
                                id="radiusNW"
                                @keyup.enter="$store.commit('properties/setRadius', {corner: 'NW', value: $event.target.value})"
                            />
                            <input 
                                class="property-input property-input-xs"
                                type="number" 
                                name="radiusNE"
                                :value="getRadius.NE"
                                id="radiusNE"
                                @keyup.enter="$store.commit('properties/setRadius', {corner: 'NE', value: $event.target.value})"
                            />
                        </div>
                        <div class="d-flex">
                            <input 
                                class="property-input property-input-xs"
                                type="number" 
                                name="radiusSW"
                                :value="getRadius.SW"
                                id="radiusSW"
                                @keyup.enter="$store.commit('properties/setRadius', {corner: 'SW', value: $event.target.value})"
                            />
                            <input 
                                class="property-input property-input-xs"

                                type="number" 
                                name="radiusSE"
                                :value="getRadius.SE"
                                id="radiusSE"
                                @keyup.enter="$store.commit('properties/setRadius', {corner: 'SE', value: $event.target.value})"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </li>
        <li v-if="getId" class="properties-menu-item">
            <button type="button" @click="toggleFill" class="property">
                <div class="bold">Fill</div>
                <div>
                    {{ fill.showProperties ? '-' : '+'}}
                </div>
            </button>
            <div class="property-container" v-if="getFill">
                <ColorPicker
                    :color="getFill"
                    @color-changed="updateProperty('fill', $event)"
                />

            </div>
        </li>
        <li v-if="getId" class="properties-menu-item">
            <button type="button" @click="toggleStroke" class="property">
                <div class="bold">Stroke</div>
                <div>
                    {{ stroke.showProperties && getStroke ? '-' : '+'}}
                </div>
            </button>
            <div class="property-container" v-if="stroke.showProperties && getStroke">
                <ColorPicker
                    v-if="getStroke"
                    :color="getStroke.style"
                    @color-changed="updateProperty('stroke',  { width: 2, style: $event})"
                />
            </div>
        </li>
        <li v-if="getId" class="properties-menu-item">
             <button type="button" @click="toggleShadow" class="property">
                <div class="bold">Shadow</div>
                <div>
                    {{ shadow.showProperties ? '-' : '+'}}
                </div>
            </button>
            <div class="property-container" v-if="shadow.showProperties && getShadow.color !== ''">
                 <div class="d-flex mb-3">
                    <div>
                        <div class="d-flex align-items-center mb-2">
                            <label for="shadowX">X </label>
                            <input
                                class="property-input property-input-xs"
                                type="number" 
                                name="shadowX"
                                :value="getShapeProperties.shadowX"
                                id="shadowX"
                                @keyup.enter="updateProperty('shadowX', $event.target.value)"
                            >
                        </div>
                        <div class="d-flex align-items-center">
                            <label for="shadowY">Y </label>
                            <input 
                                class="property-input property-input-xs"
                                type="number" 
                                name="shadowY"
                                :value="getShapeProperties.shadowY"
                                id="shadowY"
                                @keyup.enter="updateProperty('shadowY', $event.target.value)"
                            >
                        </div>
                    </div>
                    <div class="ml-3">
                        <div class="d-flex align-items-center">
                            <label for="blur">Blur </label>
                            <input
                                class="property-input property-input-xs"
                                :value="getShapeProperties.shadowBlur" 
                                type="number" 
                                name="blur" 
                                id="blur"
                                @keyup.enter="updateProperty('shadowBlur', $event.target.value)"
                            >
                        </div>
                    </div>
                </div>
                <ColorPicker
                    v-if="getShapeProperties.shadowColor"
                    :color="getShapeProperties.shadowColor"
                    @color-changed="updateProperty('shadowColor', $event)"
                />
            </div>
        </li>
        <li class="properties-menu-item">
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
        <li class="properties-menu-item">
            <button type="button" @click="$store.commit('properties/saveCanvas')" class="property">
                <div class="bold">Export</div>
                <div>
                    ...
                </div>
            </button>
        </li>
    </ul>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ColorPicker from '@/components/colorPicker/ColorPicker.vue';
import {
  State,
  namespace
} from 'vuex-class';
import { Properties, Shadow, Stroke } from '@/Types/types';
import { PropertiesStore } from '@/store/properties/types';

const properties = namespace('properties');

@Component({
    components: {
        ColorPicker,
    }
})
export default class PropertiesMenu extends Vue {
    @State('properties') public properties!: PropertiesStore;
    @properties.Getter('getShapeProperties') public getShapeProperties!: any;
    @properties.Getter('getId') public getId!: string;
    @properties.Getter('getX') public getX!: number;
    @properties.Getter('getY') public getY!: number;
    @properties.Getter('getWidth') public getWidth!: number;
    @properties.Getter('getHeight') public getHeight!: number;
    @properties.Getter('getStroke') public getStroke!: Stroke;
    @properties.Getter('getFill') public getFill!: string;
    @properties.Getter('getCanvas') public getCanvas!: string;
    @properties.Getter('getShadow') public getShadow!: Shadow;
    @properties.Getter('getShadowColor') public getShadowColor!: string;
    @properties.Getter('getRadius') public getRadius!: any;

    public stroke = {
        showProperties: false,
    }

    public fill = {
        showProperties: false,
    }

    public canvas = {
        color: 'rgba(255, 255, 255, 1)',
        showProperties: true,
    }

    public shadow = {
        showProperties: false,
    }

    public async toggleStroke() {
        this.stroke.showProperties = !this.stroke.showProperties;
        if(this.stroke.showProperties) {
            await this.$store.commit('properties/setDefaultStroke');
        } else {
            await this.$store.commit('properties/removeStroke');
        }
    }

    public toggleFill() {
        this.fill.showProperties = !this.fill.showProperties;
        if(this.fill.showProperties) {
            this.$store.commit('properties/setFillOpacity', 1);
        } else {
            this.$store.commit('properties/setFillOpacity', 0);
        }
    }

    public toggleShadow() {
        this.shadow.showProperties = !this.shadow.showProperties;
        if(this.shadow.showProperties) {
            this.$store.commit('properties/setDefaultShadow');
        } else {
            this.$store.commit('properties/removeShadow');
        }
    }

    public handleColorChanged(color: string, property: Properties) {
        switch(property) {
            case 'CANVAS':
                this.canvas.color = color;
                this.$store.commit('properties/setCanvas', color)
                break
        }
    }

    public updateProperty(property: string, value: string) {
        this.$store.dispatch('properties/setCurrentShape', {[property]: value });
    }
}
</script>