import { Licence } from "../../domain/types";

const reLicence = /^([0-9]{7})([A-HJ-NPR-Z]?)$/;
const keys = "ABCDEFGHJKLMNPRSTUVWXYZ"; // without I,O and Q

export class LicenceFFT implements Licence {

    isValid(licence: string): boolean {
        const m = licence.match(reLicence);
        return !!m && m[2] === this.getKey(m[1]);
    }

    getKey(licence: string): string | undefined {
        const m = licence.match(reLicence);
        return m ? keys[(parseInt(m[1], 10) - 1) % keys.length] : undefined;
    }
}