<template>
    <div class="colors">
        <input type="color" :value="colorToHex" class="color-picker" @change="colorChanged($event.target.value)">
        <input type="text" :value="colorToHex" class="color-code" @input="colorChanged($event.target.value)">
        <input type="text" :value="formattedOpacity" class="color-opacity" @keyup.enter="validateOpacity($event.target.value)" @blur="validateOpacity($event.target.value)">
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { isNumber, rgbaToHEX } from '@/helpers/string';
import { hexToRGBA } from '@/helpers/string';

@Component
export default class ColorPicker extends Vue {
    @Prop() public color!: string;
    private hexColor = '';

    private mounted() {
        this.hexColor = rgbaToHEX(this.color).color;
    }

    get colorToHex(): string {
        return rgbaToHEX(this.color).color;
    }

    get formattedOpacity() {
        return rgbaToHEX(this.color).opacity.toString();
    }
    set formattedOpacity(value: string) {
        const rgba = hexToRGBA(this.hexColor, parseInt(value) / 100);
        this.$emit('color-changed', rgba);
    }

    public validateOpacity(value: string) {
        const newOpacity = this.formattedOpacity.replace(/[^0-9]+/g, '')
        if(!this.formattedOpacity || !isNumber(this.formattedOpacity)) {
            this.formattedOpacity = '100';
            return;
        }
        if(isNumber(newOpacity) && parseInt(newOpacity, 10) > 100 || parseInt(newOpacity, 10) < 0) {
            this.formattedOpacity = '100';
            return;
        }
        this.formattedOpacity = value;
    }

    public colorChanged(color: string) {
        this.hexColor = color;
        console.log(color);
        const rgba = hexToRGBA(color, rgbaToHEX(this.color).opacity / 100);
        this.$emit('color-changed', rgba)
    }
}
</script>