export function removeValue<T>(array: T[], value: T) {
    const i = array.indexOf(value);
    if (i >= 0) {
        array.splice(i,1);
    }
}