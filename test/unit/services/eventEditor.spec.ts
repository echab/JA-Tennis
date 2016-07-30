//import {Container} from 'aurelia-dependency-injection';
import { EventEditor } from '../../../src/services/eventEditor';
import { Find } from '../../../src/services/util/find';
import { Undo } from '../../../src/services/util/undo';
import { Selection } from '../../../src/services/selection';
import { DialogServiceMock } from '../../mocks/dialogService_mock';
//import { GuidMock as Guid } from '../mocks/guid_mock';
//import { mathMock } from '../mocks/math_mock';

describe('eventEditor', () => {

    let eventEditor: EventEditor;

    let dialog: DialogServiceMock = new DialogServiceMock();

    beforeEach(()=> {
        let undo = new Undo();
        let selection = new Selection();
        eventEditor = new EventEditor(dialog, selection, undo);
    });

    describe('Events management', () => {

    });

});