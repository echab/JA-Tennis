export class GuidMock {

    private count = 0;

    /** Create an unique identifier */
    create(prefix: string) {
        return (prefix || '') + (this.count++);
    }
}

// export var GuidMock = (function () {
//     function GuidMock() {
//         this.count = 0;
//     }
//     /** Create an unique identifier */
//     GuidMock.prototype.create = function (prefix) {
//         return (prefix || '') + (this.count++);
//     };
//     return GuidMock;
// })();