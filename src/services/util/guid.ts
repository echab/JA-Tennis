export class Guid {

    /** Create an unique identifier */
    static create(prefix: string) {
        return (prefix || '') + Math.round(Math.random() * 999);
    }
}