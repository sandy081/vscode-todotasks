'use strict';

import { workspace, window, ExtensionContext, TextDocumentChangeEvent, languages, env, commands, TextEditor, TextEditorEdit, Position, StatusBarAlignment, StatusBarItem, TextEdit } from 'vscode';
import {TodoCommands} from './TodoCommands';
import TodoCompletionItemProvider from './TodoCompletionItemProvider';
import TodoDocumentDecorator from './TodoDocumentDecorator';
import TodoCodeActionProvider from './TodoCodeActionProvider';
import { getStatus } from './TodoStatus';
import { TodoDocument } from './TodoDocument';
let status_ = null;

export function activate(context: ExtensionContext): any {
    
    context.subscriptions.push(languages.registerCompletionItemProvider('todo', new TodoCompletionItemProvider(), '@'));
    context.subscriptions.push(languages.registerCodeActionsProvider('todo', new TodoCodeActionProvider()));
    status_ = window.createStatusBarItem(StatusBarAlignment.Left, 100);
    context.subscriptions.push(status_);
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
        let a = window.activeTextEditor
        new TodoDocument(e.document);
        let reg_file = /.*\.todo$/mg;
        if(reg_file.test(e.document.fileName))
            updateStatus(status_);
        else
            status_.hide();
    }));
    context.subscriptions.push(window.onDidChangeActiveTextEditor(e =>{
        let reg_file = /.*\.todo$/mg;
        if(reg_file.test(e.document.fileName))
            updateStatus(status_);
        else
            status_.hide();
    }));

    window.onDidChangeActiveTextEditor(editor => {
		_decorateEditor();
	}, null, context.subscriptions);

    _decorateEditor();
    updateStatus(status_);
}
function updateStatus(status: StatusBarItem):void{
    let a = getStatus();
    let asciis = [
        '[----------]',
        '[#---------]',
        '[##--------]',
        '[###-------]',
        '[####------]',
        '[#####-----]',
        '[######----]',
        '[#######---]',
        '[########--]',
        '[#########-]',
        '[##########]'
    ];
    status.text = asciis[Math.ceil((a.done/a.todo)*10)];
    status.show();
}
function _decorateEditor(delayed?:boolean) {
    let editor= window.activeTextEditor;
    if (editor && "todo" === editor.document.languageId ) {
        new TodoDocumentDecorator(editor).performDecoration(delayed);
    }
}

export function deactivate() {
}