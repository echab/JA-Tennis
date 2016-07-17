// ///<reference path="../../../lib/typings/jasmine/jasmine.d.ts"/>
// ///<reference path="../../../lib/typings/angularjs/angular-mocks.d.ts"/>

import { Find } from './find';

describe('services.find', function () {

    describe('find byIndex', function () {

        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find indexOf', function () {
            var i = Find.indexOf(a, "id", "j2");
            expect(i).toBe(1);
        });

        it('should not find indexOf zz', function () {
            var i = Find.indexOf(a, "id", "zz");
            expect(i).toBe(-1);
        });

        it('should not find indexOf idZ', function () {
            expect(() => Find.indexOf(a, "idZ", "zz", 'bad field idZ')).toThrow('bad field idZ');
        });
    });

    describe('find by', function () {

        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find by', function () {
            var o = Find.by(a, "id", "j2");
            expect(o).toEqual({ id: "j2", name: "name2" });
        });

        it('should not find indexOf zz', function () {
            var o = Find.by(a, "id", "zz");
            expect(o).toBeUndefined();
        });

        it('should not find indexOf idZ', function () {
            var o = Find.by(a, "idZ", "zz");
            expect(o).toBeUndefined();
        });
    });

});