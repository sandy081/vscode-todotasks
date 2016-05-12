'use strict';

import { workspace, window, ExtensionContext, TextDocumentChangeEvent, languages, env, commands, TextEditor, TextEditorEdit, Position } from 'vscode';
import {TodoCommands} from './TodoCommands';
import TodoCompletionItemProvider from './TodoCompletionItemProvider';
import TodoDocumentDecorator from './TodoDocumentDecorator';
import TodoCodeActionProvider from './TodoCodeActionProvider';

export function activate(context: ExtensionContext): any {
    
    context.subscriptions.push(languages.registerCompletionItemProvider('todo', new TodoCompletionItemProvider(), '@'));
    context.subscriptions.push(languages.registerCodeActionsProvider('todo', new TodoCodeActionProvider()));

    languages.setLanguageConfiguration('todo', {
        wordPattern: /(-?\d*\.\d\w*)|([^\-\`\~\!\#\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        indentationRules: {
            increaseIndentPattern: /^\s*\w+.+:\s*$/,
            decreaseIndentPattern: /^\uffff$/ //Does not match any
        }
    });

    let todoCommands= new TodoCommands();
    context.subscriptions.push(todoCommands.registerNewTaskCommand());
    context.subscriptions.push(todoCommands.registerCompleteTaskCommand());
    context.subscriptions.push(todoCommands.registerCancelTaskCommand());
    context.subscriptions.push(workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        _decorateEditor(true);
    }));

    window.onDidChangeActiveTextEditor(editor => {
		_decorateEditor();
	}, null, context.subscriptions);

    _decorateEditor();
}

function _decorateEditor(delayed?:boolean) {
    let editor= window.activeTextEditor;
    if (editor && "todo" === editor.document.languageId ) {
        new TodoDocumentDecorator(editor).performDecoration(delayed);
    }
}

export function deactivate() {
}