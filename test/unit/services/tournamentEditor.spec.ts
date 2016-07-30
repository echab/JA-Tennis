import { TournamentEditor } from '../../../src/services/tournamentEditor';
import { Undo } from '../../../src/services/util/undo';
import { Selection } from '../../../src/services/selection';
import { DialogServiceMock } from '../../mocks/dialogService_mock';

describe('tournamentEditor', () => {

	let tournamentEditor: TournamentEditor;

	let undo = new Undo();
	let selection = new Selection();
	let dialog: DialogServiceMock = new DialogServiceMock();

	beforeEach(() => {
		tournamentEditor = new TournamentEditor(dialog, selection, undo);
	});

	it('should load a tournament from url', () => {

		// dialog.ok(tournament1.info);

		// tournamentEditor.load('myurl').then(tournament => {
		// 	expect()
		// });

	});

});