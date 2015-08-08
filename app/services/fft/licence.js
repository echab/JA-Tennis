var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Licence = (function () {
            function Licence() {
            }
            Licence.prototype.isValid = function (licence) {
                var a = Licence.reLicence.exec(licence + " ");
                if (a === null) {
                    return false;
                }
                //check licence key
                var v = parseInt(a[1]);
                var k = Licence.keys.charAt(v % 23);
                return k == a[2];
            };
            Licence.reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
            Licence.keys = "ABCDEFGHJKLMNPRSTUVWXYZ";
            return Licence;
        })();
        fft.Licence = Licence;
        angular.module('jat.services.fft.licence', [])
            .service('licence', Licence);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
