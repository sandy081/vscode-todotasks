'use strict';

import { commands, TextEditor, TextEditorEdit, Range, Position, TextLine, TextDocumentChangeEvent } from 'vscode';
import {TodoDocument} from './TodoDocument';
import TodoDocumentDecorator from './TodoDocumentDecorator';
export class TodoDocumentEditor {
    constructor(private _textEditor: TextEditor, private _textEditorEdit: TextEditorEdit) {
    }

    public createNewTask() {
        let todoDocument= new TodoDocument(this._textEditor.document);
        let task= todoDocument.getTask(this._textEditor.selection.active);
        
        if (task) {
            // TODO: Create task in the next line
            return;
        }

        let taskLine= this._textEditor.document.lineAt(this._textEditor.selection.active);
        let taskDescription= taskLine.text.trim();
        this.updateTask(taskLine, taskDescription, TodoDocument.SYMBOL_NEW_TASK);
    }

    public completeCurrentTask() {
        let todoDocument= new TodoDocument(this._textEditor.document);
        let pos= this._textEditor.selection.active;
        var task= todoDocument.getTask(pos);
        
        if (!task || task.isEmpty()) {
            return;
        }

        if (task.isDone()) {
            this.updateTask(task.taskLine, task.getDescription(), TodoDocument.SYMBOL_NEW_TASK);
            return;
        }

        this.updateTask(task.taskLine, task.getDescription(), TodoDocument.SYMBOL_DONE_TASK, TodoDocument.ACTION_DONE);
    }

    public cancelCurrentTask() {
        let todoDocument= new TodoDocument(this._textEditor.document);
        let pos= this._textEditor.selection.active;
        var task= todoDocument.getTask(pos);
        
        if (!task) {
            return;
        }
        if (task.isEmpty()) {
            return;
        }
        if (task.isDone()) {
            return;
        }
        if (task.isCancelled()) {
            return;
        }

        this.updateTask(task.taskLine, task.getDescription(), TodoDocument.SYMBOL_CANCEL_TASK, TodoDocument.ACTION_CANCELLED);
    }

    private updateTask(taskLine: TextLine, taskDescription: string, symbol: string, tag?: string) {
        var timestamp = new Date(); 
        this._textEditorEdit.delete(new Range(new Position(taskLine.lineNumber, taskLine.firstNonWhitespaceCharacterIndex), taskLine.range.end));
        this.insertTask(new Position(taskLine.lineNumber, taskLine.firstNonWhitespaceCharacterIndex), symbol + " " + taskDescription + (tag ? (" " + TodoDocument.toTag(tag)+' (' + timestamp.toLocaleString() + ')'): ""));
    }

    private insertTask(pos: Position, task: string) {
        this._textEditorEdit.insert(pos, task);
        new TodoDocumentDecorator(this._textEditor).performDecoration();
    }
}
