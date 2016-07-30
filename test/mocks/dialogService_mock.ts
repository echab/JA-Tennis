import { DialogService, DialogResult, DialogController } from 'aurelia-dialog';

export class DialogServiceMock implements DialogService {

	wasCancelled = false;
	result: any;

	controllers = [];
	hasActiveDialog = true;

	ok(result: any) {
		this.wasCancelled = false;
		this.result = result;
	}
	cancel(result?: any) {
		this.wasCancelled = true;
		this.result = result;
	}

	open(settings?: Object): Promise<DialogResult> {
		return new Promise((resolve, reject) => {
			resolve({
				wasCancelled: this.wasCancelled,
				output: this.result
			});
		});
	}

	openAndYieldController(settings?: Object): Promise<DialogController> {
		return new Promise((resolve, reject) => {
			//TODO
		});
	}
}

// export class DialogServiceMock {

// 	wasCancelled = false;
// 	result;

// 	controllers = [];
// 	hasActiveDialog = true;

// 	ok(result) {
// 		this.wasCancelled = false;
// 		this.result = result;
// 	}
	
// 	cancel(result) {
// 		this.wasCancelled = true;
// 		this.result = result;
// 	}

// 	open(settings) {
// 		return new Promise((resolve, reject) => {
// 			resolve({
// 				wasCancelled: this.wasCancelled,
// 				output: this.result
// 			});
// 		});
// 	}

// 	openAndYieldController(settings) {
// 		return new Promise((resolve, reject) => {
// 			//TODO
// 		});
// 	}
// }