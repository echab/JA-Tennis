'use strict';
describe('services.find', function () {
    var find;

    it('should inject find', function () {
        module('jat.services.find');
        inject(function (_find_) {
            find = _find_;
        });
    });

    describe('find byIndex', function () {
        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find indexOf', function () {
            var i = find.indexOf(a, "id", "j2");
            expect(i).toBe(1);
        });

        it('should not find indexOf zz', function () {
            var i = find.indexOf(a, "id", "zz");
            expect(i).toBe(-1);
        });

        it('should not find indexOf idZ', function () {
            expect(function () {
                return find.indexOf(a, "idZ", "zz", 'bad field idZ');
            }).toThrow('bad field idZ');
        });
    });

    describe('find by', function () {
        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find by', function () {
            var o = find.by(a, "id", "j2");
            expect(o).toEqual({ id: "j2", name: "name2" });
        });

        it('should not find indexOf zz', function () {
            var o = find.by(a, "id", "zz");
            expect(o).toBeUndefined();
        });

        it('should not find indexOf idZ', function () {
            var o = find.by(a, "idZ", "zz");
            expect(o).toBeUndefined();
        });
    });
});
//# sourceMappingURL=find.Spec.js.map
