<template>
    <div class="colors">
        <input type="color" :value="colorToHex" class="color-picker" @change="validateColor($event.target.value)">
        <input type="text" :value="colorToHex" class="color-code" @keyup.enter="validateColor($event.target.value)" @blur="validateColor($event.target.value)">
        <input type="number" :value="formattedOpacity" class="property-input property-input-xs" @keyup.enter="validateOpacity($event.target.value)" @blur="validateOpacity($event.target.value)">
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { isNumber, rgbaToHEX } from '@/helpers/string';
import { hexToRGBA } from '@/helpers/string';

@Component
export default class ColorPicker extends Vue {
    @Prop({default: 'rgba(248, 18, 18, 0.452)'}) public color!: string;
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

    public validateColor(color: string) {
        const isValid = /^#[0-9A-F]{6}$/i.test(color);
        if(!isValid) {
            this.$emit('color-changed', 'rgba(255, 192, 203, 1)');
            return;
        }
        this.colorChanged(color);
    }

    public colorChanged(color: string) {
        this.hexColor = color;
        const rgba = hexToRGBA(color, rgbaToHEX(this.color).opacity / 100);
        this.$emit('color-changed', rgba)
    }
}
</script>