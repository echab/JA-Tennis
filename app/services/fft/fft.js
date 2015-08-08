var jat;
(function (jat) {
    var fft;
    (function (fft) {
        angular.module('jat.services.type', [
            'jat.services.fft.score',
            'jat.services.fft.category',
            'jat.services.fft.licence',
            'jat.services.fft.matchFormat',
            'jat.services.fft.rank',
            'jat.services.fft.ranking'
        ]);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
