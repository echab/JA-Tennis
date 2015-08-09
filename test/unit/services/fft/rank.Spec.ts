///<reference path="../../../../lib/typings/jasmine/jasmine.d.ts"/>
///<reference path="../../../../lib/typings/angularjs/angular-mocks.d.ts"/>
///<reference path="../../../../app/models/types/rank.d.ts"/>

describe('services.fft.rank', function () {
    var rank: jat.fft.RankFFT;

    it('should inject rank', function () {
        module('jat.services.type');
        inject(function (_rank_: jat.fft.RankFFT) {
            rank = _rank_;
        });
    });

    describe('list rank', function () {

        it('should list', function () {
            var ranks = rank.list();
            expect(ranks.length).toBe(27);
            expect(ranks[0]).toBe("NC");
            expect(ranks[1]).toBe("40");
            expect(ranks[26]).toBe("-30");
        });
    });

    describe('isValid rank', function () {

        it('NC should', function () {
            var v = rank.isValid("NC");
            expect(v).toBe(true);
        });
        it('ZZ should', function () {
            var v = rank.isValid("ZZ");
            expect(v).toBe(false);
        });
    });

    describe('next rank', function () {

        it('of NC should', function () {
            var r = rank.next("NC");
            expect(r).toBe("40");
        });
        it('of 40 should', function () {
            var r = rank.next("40");
            expect(r).toBe("30/5");
        });
        it('of 30/1 should', function () {
            var r = rank.next("30/1");
            expect(r).toBe("30");
        });
    });

    describe('previous rank', function () {

        it('of NC should', function () {
            var r = rank.previous("NC");
            expect(r).toBeUndefined();
        });
        it('of 40 should', function () {
            var r = rank.previous("40");
            expect(r).toBe("NC");
        });
        it('of 30 should', function () {
            var r = rank.previous("30");
            expect(r).toBe("30/1");
        });
    });

    describe('compare rank', function () {

        it('of NC and NC', function () {
            var c = rank.compare("NC", "NC");
            expect(c).toBe(0);
        });
        it('of 30/4 and 30/2', function () {
            var c = rank.compare("30/4", "30/2");
            expect(c).toBeLessThan(0);
        });
        it('of 15/5 and 30/1', function () {
            var c = rank.compare("15/5", "30/1");
            expect(c).toBeGreaterThan(0);
        });
    });

    describe('groups rank', function () {

        it('should list', function () {
            var groups = rank.groups();
            expect(groups.length).toBe(5);
        });
    });

    describe('groupOf rank', function () {

        it('NC should be', function () {
            var g = rank.groupOf("NC");
            expect(g).toBe("4e série");
        });
        it('30/1 should be', function () {
            var g = rank.groupOf("30/1");
            expect(g).toBe("4e série");
        });
        it('30 should be', function () {
            var g = rank.groupOf("30");
            expect(g).toBe("3e série");
        });
        it('-15 should be', function () {
            var g = rank.groupOf("-15");
            expect(g).toBe("promotion");
        });
    });

    //groupOf(r)

});
