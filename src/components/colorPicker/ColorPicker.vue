<template>
    <div class="colors">
        <input type="color" :value="color" class="color-picker" @change="$emit('color-changed', $event.target.value)">
        <input type="text" :value="color" class="color-code" @input="$emit('color-changed', $event.target.value)">
        <input type="text" :value="formattedOpacity" @input="formattedOpacity = $event.target.value" class="color-opacity" @keyup.enter="validateOpacity" @blur="validateOpacity">
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { isNumber } from '@/helpers/string';

@Component
export default class ColorPicker extends Vue {
    @Prop() public color!: string;
    @Prop() public opacity!: string;

    get formattedOpacity() {
        return this.opacity + '%';
    }
    set formattedOpacity(value: string) {
        const newOpacity = value.replace(/%/, '');
        this.$emit('opacity-changed', newOpacity);
    }

    public validateOpacity() {
        const newOpacity = this.formattedOpacity.replace(/%/, '')
        if(!this.formattedOpacity || !isNumber) {
            this.formattedOpacity = '100';
        }
        if(isNumber(newOpacity) && parseInt(newOpacity, 10) > 100 ||parseInt(newOpacity, 10) < 0) {
            this.formattedOpacity = '100';
        }
    }
}
</script>