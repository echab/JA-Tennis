///<reference path="../../../lib/typings/jasmine/jasmine.d.ts"/>
///<reference path="../../../lib/typings/angularjs/angular-mocks.d.ts"/>

import { Category,CategoryString} from '../../models/types';

describe('services.fft.score', function () {
    var score: ScoreFFT;

    it('should inject score', function () {
        module('jat.services.type');
        inject(function (_score_: ScoreFFT) {
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
