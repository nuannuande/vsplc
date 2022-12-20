"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
// import { CatScratchEditorProvider } from './catScratchEditor';
// import { PawDrawEditorProvider } from './pawDrawEditor';
const PLCEditor_1 = require("./PLCEditor");
function activate(context) {
    // Register our custom editor providers
    // context.subscriptions.push(CatScratchEditorProvider.register(context));
    // context.subscriptions.push(PawDrawEditorProvider.register(context));
    context.subscriptions.push(PLCEditor_1.PLCEditorProvider.register(context));
    vscode.commands.registerCommand('vsplc.runPlc', () => {
    });
    // let worker = fork('./run.js');
    // console.log(worker);
    // worker.on('exit', () => {
    // 	console.log('child progress exit');
    // });
    // //向子进程发送
    // worker.send({ hello: 'child' });
    // //监听子进程发来的信息
    // worker.on('message', (msg) => {
    // 	console.log('from child', msg);
    // });
    // worker.on('error', (err) => {
    // 	console.log(err);
    // 	// This will be called with err being an AbortError if the controller aborts
    // });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map