///<reference path="../../../../lib/typings/jasmine/jasmine.d.ts"/>
///<reference path="../../../../lib/typings/angularjs/angular-mocks.d.ts"/>
///<reference path="../../../../app/models/types/category.d.ts"/>
'use strict';
describe('services.fft.category', function () {
    var category;
    var now = new Date();
    //var march = new Date(2014, 2, 14);
    //var november = new Date(2014, 10, 14);
    it('should inject category', function () {
        module('jat.services.type');
        inject(function (_category_) {
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
