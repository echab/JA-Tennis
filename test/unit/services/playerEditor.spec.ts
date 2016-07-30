//import {Container} from 'aurelia-dependency-injection';
import { PlayerEditor } from '../../../src/services/playerEditor';
import { Undo } from '../../../src/services/util/undo';
import { Selection, ModelType } from '../../../src/services/selection';
import { DialogServiceMock } from '../../mocks/dialogService_mock';
import { GuidMock as Guid } from '../../mocks/guid_mock';
//import '../../mocks/math_mock';
//import { mathMock } from '../../mocks/math_mock';

describe('playerEditor', () => {

    let playerEditor: PlayerEditor;

    let dialog: DialogServiceMock = new DialogServiceMock();

    var tournament1: Tournament = {
        id: 't1', info: { name: 'Tournament 1' },
        players: [],
        events: []
    };

    var player1: Player = { id: 'p1', name: 'Eloi', rank: '30/3', registration: [], _tournament: tournament1 };
    var player2: Player = { id: 'p2', name: 'Denis', rank: '4/6', registration: [], _tournament: tournament1 };

    beforeEach(() => {
        let undo = new Undo();
        let selection = new Selection();
        selection.select(tournament1, ModelType.Tournament);
        playerEditor = new PlayerEditor(dialog, selection, undo);
    });

    //clean tournament1
    afterEach(() => tournament1.players.splice(0, tournament1.players.length));


    it('should add player', () => {

        playerEditor._addPlayer(tournament1, player1);

        expect(tournament1.players.length).toBe(1);
        expect(tournament1.players[0].name).toBe('Eloi');
        expect(tournament1.players[0].rank).toBe('30/3');
    });

    it('should remove player', function () {
        //main.select(tournament1);
        tournament1.players.push(player1);

        playerEditor.remove(player1);

        expect(tournament1.players.length).toBe(0);
    });

    it('should edit player', function () {
        //main.select(tournament1);
        tournament1.players.push(player1);

        playerEditor._editPlayer(player1, player2);

        expect(tournament1.players[0].name).toBe('Eloi');

        //main.doUndo();
        //expect(tournament1.players[0].name).toBe('Denis');
    });

});
