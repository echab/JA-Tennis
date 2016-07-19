import { Find } from '../../../../src/services/util/find';

describe('services.find', () => {

    describe('find byIndex', () => {

        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find indexOf', () => {
            var i = Find.indexOf(a, "id", "j2");
            expect(i).toBe(1);
        });

        it('should not find indexOf zz', () => {
            var i = Find.indexOf(a, "id", "zz");
            expect(i).toBe(-1);
        });

        it('should not find indexOf idZ', () => {
            expect(() => Find.indexOf(a, "idZ", "zz", 'bad field idZ')).toThrow('bad field idZ');
        });
    });

    describe('find by', () => {

        var a = [
            { id: "j1", name: "name1" },
            { id: "j2", name: "name2" },
            { id: "j3", name: "name3" }
        ];

        it('should find by', () => {
            var o = Find.by(a, "id", "j2");
            expect(o).toEqual({ id: "j2", name: "name2" });
        });

        it('should not find indexOf zz', () => {
            var o = Find.by(a, "id", "zz");
            expect(o).toBeUndefined();
        });

        it('should not find indexOf idZ', () => {
            var o = Find.by(a, "idZ", "zz");
            expect(o).toBeUndefined();
        });
    });

});