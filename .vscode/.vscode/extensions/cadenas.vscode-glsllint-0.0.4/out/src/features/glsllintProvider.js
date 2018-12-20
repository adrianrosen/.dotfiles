'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const vscode = require("vscode");
class GLSLLintingProvider {
    activate(subscriptions) {
        this.command = vscode.commands.registerCommand(GLSLLintingProvider.commandId, this.runCodeAction, this);
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        vscode.workspace.onDidOpenTextDocument(this.doLint, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.doLint, this);
        vscode.workspace.textDocuments.forEach(this.doLint, this);
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
    doLint(textDocument) {
        if (textDocument.languageId !== 'glsl') {
            return;
        }
        const config = vscode.workspace.getConfiguration('glsllint');
        // The code you place here will be executed every time your command is
        // executed
        if (config.glslangValidatorPath === null ||
            config.glslangValidatorPath === '') {
            vscode.window.showErrorMessage('GLSL Lint: config.glslangValidatorPath is empty, please set it to the executable');
            return;
        }
        let decoded = '';
        let diagnostics = [];
        // Split the arguments string from the settings
        let args = config.glslangValidatorArgs.split(/\s+/).filter(arg => arg);
        args.push(textDocument.fileName);
        let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } :
            undefined;
        let childProcess = cp.spawn(config.glslangValidatorPath, args, options);
        if (childProcess.pid) {
            childProcess.stdout.on('data', (data) => { decoded += data; });
            childProcess.stdout.on('end', () => {
                let lines = decoded.toString().split(/(?:\r\n|\r|\n)/g);
                lines.forEach(line => {
                    if (line !== '') {
                        let severity = undefined;
                        if (line.startsWith('ERROR:')) {
                            severity = vscode.DiagnosticSeverity.Error;
                        }
                        if (line.startsWith('WARNING:')) {
                            severity = vscode.DiagnosticSeverity.Warning;
                        }
                        if (severity !== undefined) {
                            let matches = line.match(/WARNING:|ERROR:\s.+?(?=:(\d)+):(\d*): (\W.*)/);
                            if (matches && matches.length == 4) {
                                let message = matches[3];
                                let errorline = parseInt(matches[2]);
                                let range = new vscode.Range(errorline - 1, 0, errorline - 1, 0);
                                let diagnostic = new vscode.Diagnostic(range, message, severity);
                                diagnostics.push(diagnostic);
                            }
                        }
                    }
                });
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            });
        }
    }
    provideCodeActions(document, range, context, token) {
        throw new Error('Method not implemented.');
    }
    runCodeAction(document, range, message) {
        throw new Error('Method not implemented.');
    }
}
GLSLLintingProvider.commandId = 'glsllint.runCodeAction';
exports.default = GLSLLintingProvider;
//# sourceMappingURL=glsllintProvider.js.map