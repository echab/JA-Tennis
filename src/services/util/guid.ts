/** Create an unique identifier */
export function guid(prefix: string) {
    return (prefix || '') + Math.round(Math.random() * 999);
}