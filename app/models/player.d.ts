declare namespace models {

    export interface Player {

        id: string;

        //General info
        name: string;
        firstname?: string;
        sexe?: string;
        birth?: Date;
        category?: string;
        club?: string;
        licence?: string;
        nationality?: string;
        external ?: boolean;   //TODO FFT extent
        assimilated ?: boolean;    //TODO FFT extent
        rank: string;
        rank2 ?: string;

        //Registrations
        registration: string[]; //Event ids
        solde?: Number;

        //Coordinates
        adress1?: string;
        adress2?: string;
        zipCode?: string;
        city?: string;
        phone1?: string;
        phone2?: string;
        email?: string;

        //Teams
        players?: Player[];  //TODO class Team extends Player

        //Availability
        comment?: string;

        _tournament ?: Tournament;
    }
}