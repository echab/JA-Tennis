'use strict';

describe('services.fft.rank', function () {
    var rank: ServiceRank;

    it('should inject rank', function () {
        module('jat.services.type');
        inject(function (_rank_: ServiceRank) {
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

//=========================

describe('services.fft.category', function () {
    var category: jat.service.Category; // ServiceCategory;
    var now = new Date();
    //var march = new Date(2014, 2, 14);
    //var november = new Date(2014, 10, 14);

    it('should inject category', function () {
        module('jat.services.type');
        inject(function (_category_: jat.service.Category) {
            category = _category_;
        });
    });

    describe('list category', function () {

        it('should list', function () {
            var categories = category.list();
            expect(categories.length).toBe(18);
            expect(categories[0]).toBe("-8ans");
            expect(categories[17]).toBe("+75ans");
        });
    });

    describe('isValid category', function () {

        it('Senior should', function () {
            var v = category.isValid("Senior");
            expect(v).toBe(true);
        });
        it('ZZ should', function () {
            var v = category.isValid("ZZ");
            expect(v).toBe(false);
        });
    });

    describe('currentYear category', function () {
        it('should change in october', function () {
            var y = now.getMonth() < 9 ? now.getFullYear() : now.getFullYear() + 1;
            expect(category.currentYear).toBe(y);
        });
    });

    describe('getAge category', function () {
        it('should be 8', function () {
            var d = new Date(category.currentYear - 8, 4, 24);
            var v = category.getAge(d);
            expect(v).toBe(8);
        });

        it('should be 20 for may', function () {
            var d = new Date(category.currentYear - 20, 4, 24);
            var v = category.getAge(d);
            expect(v).toBe(20);
        });

        it('should be 20 for november', function () {
            var d = new Date(category.currentYear - 20, 10, 24);
            var v = category.getAge(d);
            expect(v).toBe(20);
        });
    });

    describe('ofDate category', function () {

        it('1971-May should', function () {
            var d = new Date(now.getFullYear() - 43, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe('+35ans');
        });

        it('1969-Oct should', function () {
            var d = new Date(now.getFullYear() - 46, 9, 8);
            var v = category.ofDate(d);
            expect(v).toBe('+45ans');
        });

        it('now-10 should', function () {
            var d = new Date(category.currentYear - 10, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe("-10ans");
        });
        it('now-20 should', function () {
            var d = new Date(category.currentYear - 20, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe("Senior");
        });
        it('now-34 should', function () {
            var d = new Date(category.currentYear - 34, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe("Senior");
        });
        it('now-35 should', function () {
            var d = new Date(category.currentYear - 35, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe("+35ans");
        });
        it('now-36 should', function () {
            var d = new Date(category.currentYear - 36, 4, 24);
            var v = category.ofDate(d);
            expect(v).toBe("+35ans");
        });
    });

    describe('compare category', function () {

        it('of Senior and Senior', function () {
            var c = category.compare("Senior", "Senior");
            expect(c).toBe(0);
        });
        it('of +35ans and +45ans', function () {
            var c = category.compare("+35ans", "+45ans");
            expect(c).toBeLessThan(0);
        });
        it('of +45ans and Senior', function () {
            var c = category.compare("+45ans", "Senior");
            expect(c).toBeGreaterThan(0);
        });
    });
});

//=========================

describe('services.fft.score', function () {
    var score: ServiceScore;

    it('should inject score', function () {
        module('jat.services.type');
        inject(function (_score_: ServiceScore) {
            score = _score_;
        });
    });

    describe('isValid score', function () {

        it('6/0 6/1 should be valid', function () {
            var s = score.isValid("6/0 6/1");
            expect(s).toBe(true);
        });

        it('6/0 6/1 Ab should be valid', function () {
            var s = score.isValid("6/0 6/1 Ab");
            expect(s).toBe(true);
        });

        it('7/0 6/1 should be invalid', function () {
            var s = score.isValid("7/0 6/1");
            expect(s).toBe(false);
        });

    });
});
