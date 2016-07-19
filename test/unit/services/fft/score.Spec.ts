import { ScoreFFT } from '../../../../src/services/fft/score'

describe('services.fft.score', function () {
    var score: ScoreFFT;

    it('should inject score', function () {
        score = new ScoreFFT();
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
