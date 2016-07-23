export class GuidMock {

    private count = 0;

    /** Create an unique identifier */
    public create(prefix: string) {
        return (prefix || '') + (this.count++);
    }
}