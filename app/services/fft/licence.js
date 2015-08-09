var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var LicenceFFT = (function () {
            function LicenceFFT() {
            }
            LicenceFFT.prototype.isValid = function (licence) {
                var a = LicenceFFT.reLicence.exec(licence + " ");
                if (a === null) {
                    return false;
                }
                //check licence key
                var v = parseInt(a[1]);
                var k = LicenceFFT.keys.charAt(v % 23);
                return k == a[2];
            };
            LicenceFFT.reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
            LicenceFFT.keys = "ABCDEFGHJKLMNPRSTUVWXYZ";
            return LicenceFFT;
        })();
        fft.LicenceFFT = LicenceFFT;
        angular.module('jat.services.fft.licence', [])
            .service('licence', LicenceFFT);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
