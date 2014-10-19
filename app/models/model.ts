'use strict';

module models {

    export interface Model {
        //TODO serialize()
        //init(parent?:Model):void;
    }

    export enum DrawType { Normal, Final, PouleSimple, PouleAR }

    export enum GenerateType { None, Create, PlusEchelonne, PlusEnLigne, Mix }

    export enum ModelType { None, Tournament, Player, Event, Draw, Match, Box }
}