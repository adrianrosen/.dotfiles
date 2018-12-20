'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const glsllintProvider_1 = require("./features/glsllintProvider");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let linter = new glsllintProvider_1.default();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('glsl', linter);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map