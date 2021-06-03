<template>
    <ul class="properties-menu">
        <li class="properties-menu-item">
            <div>Align</div>
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
                    <label for="X">X </label>
                    <input
                        class="property-input"
                        :value="getShapeProperties.x" 
                        type="number" 
                        name="X" 
                        id="X"
                        @keyup.enter="updateProperty('x', $event.target.value)"
                    >
                </div>
                <div class="d-flex align-items-center">
                    <label for="Y">Y </label>
                    <input 
                        class="property-input"
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
                    <label for="width">W </label>
                    <input 
                        class="property-input"
                        :value="getShapeProperties.width" 
                        type="number" 
                        name="width" 
                        id="width"
                        @keyup.enter="updateProperty('width', $event.target.value)"
                    >
                </div>
                <div class="d-flex align-items-center">
                    <label for="height">H </label>
                    <input 
                        class="property-input"
                        :value="getShapeProperties.height" 
                        type="number" 
                        name="height" 
                        id="height"
                        @keyup.enter="updateProperty('height', $event.target.value)"
                    >
                </div>
            </div>
            <div class="mt-3">
                <label for="rotation">Rotation</label>
                    <input 
                        class="property-input"
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
                    <div>
                        <input 
                            class="property-input"
                            type="number" 
                            name="radiusNW"
                            :value="getRadius.NW"
                            id="radiusNW"
                            @keyup.enter="$store.commit('properties/setRadius', {corner: 'NW', value: $event.target.value})"
                        />
                        <input 
                            class="property-input"
                            type="number" 
                            name="radiusNE"
                            :value="getRadius.NE"
                            id="radiusNE"
                            @keyup.enter="$store.commit('properties/setRadius', {corner: 'NE', value: $event.target.value})"
                        />
                    </div>
                    <div>
                        <input 
                            class="property-input"
                            type="number" 
                            name="radiusSE"
                            :value="getRadius.SE"
                            id="radiusSE"
                            @keyup.enter="$store.commit('properties/setRadius', {corner: 'SE', value: $event.target.value})"
                        />
                        <input 
                            class="property-input"
                            type="number" 
                            name="radiusSW"
                            :value="getRadius.SW"
                            id="radiusSW"
                            @keyup.enter="$store.commit('properties/setRadius', {corner: 'SW', value: $event.target.value})"
                        />
                    </div>
                </div>
            </div>
        </li>
        <li v-if="getId" class="properties-menu-item">
            <button type="button" @click="toggleFill" class="property m-negative-2">
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
            <button type="button" @click="toggleStroke" class="property m-negative-2">
                <div class="bold">Stroke</div>
                <div>
                    {{ stroke.showProperties ? '-' : '+'}}
                </div>
            </button>
            <div class="property-container" v-if="getStroke">
                <ColorPicker 
                    :color="getStroke ? getStroke.style : stroke.color"
                    @color-changed="updateProperty('stroke',  { width: 1, style: $event})"
                />
            </div>
        </li>
        <li v-if="getId" class="properties-menu-item">
             <button type="button" @click="toggleShadow" class="property m-negative-2">
                <div class="bold">Shadow</div>
                <div>
                    <button v-if="getShadow.color" @click="$store.commit('properties/removeShadow')">-</button>
                    <div v-else>+</div>
                </div>
            </button>
            <div class="property-container" v-if="getShadow.color !== ''">
                 <div class="d-flex mb-3">
                    <div>
                        <div class="d-flex align-items-center mb-2">
                            <label for="shadowX">X </label>
                            <input
                                class="property-input"
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
                                class="property-input"
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
                                class="property-input"
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
             <div class="property m-negative-2">
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
            <button type="button" @click="$store.commit('properties/saveCanvas')" class="property m-negative-2">
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
    public shadow = {
        showProperties: false,
    }

    @Watch('getShadowColor')
    private onShadowChange(shadowProperties: any) {
        // console.log(shadowProperties);
        
    }

    public toggleStroke() {
        this.stroke.showProperties = !this.stroke.showProperties;
    }

    public toggleFill() {
        this.fill.showProperties = !this.fill.showProperties;
    }

    public toggleShadow() {
        if(this.getId !== '' && this.getShapeProperties.shadowColor !== '') {
            this.shadow.showProperties = true;
            return;
        }
        if(this.getId !== '' && this.getShapeProperties.shadowColor === '') {

            this.$store.commit('properties/setDefaultShadow');
            this.shadow.showProperties = true;
            return;
        } 
        this.shadow.showProperties = false;
        this.$store.dispatch('properties/removeShadow');
        
    }

    public handleColorChanged(color: string, property: Properties) {
        switch(property) {
            // case 'STROKE':
            //     this.stroke.color = color;
            //     this.$store.commit('properties/setStroke', {style: color, width: 1})
            //     break;
            // case 'FILL':
            //     this.fill.color = color;
            //     this.$store.commit('properties/setFill', color)
            //     break;
            // case 'SHADOW':
            //     // this.fill.color = color;
            //     this.$store.commit('properties/setShadowProperty', { property: 'shadowColor', value: color })
            //     break;
            case 'CANVAS':
                this.canvas.color = color;
                this.$store.commit('properties/setCanvas', color)
                break
        }
    }

    public updateProperty(property: string, value: string) {
        this.$store.dispatch('properties/setCurrentShape', {[property]: value });
        // this.$emit('update-properties');
    }
}
</script>