export const isNumber = (str: number | string) => {
    if (typeof str !== "string") {
        return false;
    }
    const n = str as unknown as number;
    return !isNaN(n) && !isNaN(parseFloat(str));
}