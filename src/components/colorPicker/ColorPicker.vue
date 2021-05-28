<template>
    <div class="colors">
        <input type="color" :value="pickedColor" class="color-picker" @change="pickedColor = $event.target.value">
        <input type="text" v-model="pickedColor" class="color-code">
        <input type="text" v-model="opacity" class="color-opacity" @keyup.enter="validate" @blur="validate()">
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class ColorPicker extends Vue {
    public pickedColor = '#ffc0cb';
    private o = '42';
    
    get opacity() {
        return this.o + '%';
    }
    set opacity(value: string) {
        const newOpacity = value.replace(/%/, '');
        this.o = newOpacity;
    }

    public validate() {
        const newOpacity = this.opacity.replace(/%/, '')
        const isNumber = this.isNumber(newOpacity);
        console.log(isNumber);
        if(!this.o || !isNumber) {
            this.opacity = '100';
        }
        if(isNumber && parseInt(newOpacity, 10) > 100 ||parseInt(newOpacity, 10) < 0) {
            this.opacity = '100';
        }
    }

    private isNumber(str: number | string) {
        if (typeof str !== "string") {
            return false;
        }
        const n = str as unknown as number;
        return !isNaN(n) && !isNaN(parseFloat(str));
    }
}
</script>