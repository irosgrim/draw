export const isNumber = (str: number | string) => {
    if (typeof str !== "string") {
        return false;
    }
    const n = str as unknown as number;
    return !isNaN(n) && !isNaN(parseFloat(str));
}

export const hexToRGBA = (hex: string, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const rgbaToHEX = (rgba: string) =>{
    const _rgba = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
    const rgb = [..._rgba.slice(0, 3)].map( x => {
        const hex = Number(x).toString(16).length < 2 ?  '0' + Number(x).toString(16) : Number(x).toString(16);
        return hex;
    }).join('');
    const hex = `#${rgb}`
    return {
        color: hex,
        opacity: parseFloat(_rgba[3]) * 100
    };
}