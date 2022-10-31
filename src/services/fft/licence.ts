import { Licence } from "../../domain/types";

export class LicenceFFT implements Licence {

    private static reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
    private static keys = "ABCDEFGHJKLMNPRSTUVWXYZ";

    isValid(licence: string): boolean {

        const a = LicenceFFT.reLicence.exec(licence + " ");

        if (a === null) {
            return false;
        }

        //check licence key
        const v = parseInt(a[1]);
        const k = LicenceFFT.keys.charAt(v % 23);

        return k === a[2];
    }
}