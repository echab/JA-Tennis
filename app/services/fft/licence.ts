namespace jat.fft {

    export class Licence implements ServiceLicence {

        private static reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
        private static keys = "ABCDEFGHJKLMNPRSTUVWXYZ";

        isValid(licence: string): boolean {

            var a = Licence.reLicence.exec(licence + " ");

            if (a === null) {
                return false;
            }

            //check licence key
            var v = parseInt(a[1]);
            var k = Licence.keys.charAt(v % 23);

            return k == a[2];
        }
    }

    angular.module('jat.services.fft.licence', [])
        .service('licence', Licence)
    ;
}