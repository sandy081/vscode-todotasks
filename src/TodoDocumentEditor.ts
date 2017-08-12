'use strict';

import { commands, TextEditor, TextEditorEdit, Range, Position, TextLine, TextDocumentChangeEvent, workspace } from 'vscode';
import {TodoDocument} from './TodoDocument';
import TodoDocumentDecorator from './TodoDocumentDecorator';
import {TodoConfiguration} from './TodoConfiguration';

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
        this.updateTask(taskLine, taskDescription, TodoConfiguration.SYMBOL_NEW_TASK);
    }

    public completeCurrentTask() {
        let todoDocument= new TodoDocument(this._textEditor.document);
        let pos= this._textEditor.selection.active;
        var task= todoDocument.getTask(pos);
        
        if (!task || task.isEmpty()) {
            return;
        }

        if (task.isDone()) {
            this.updateTask(task.taskLine, task.getDescription(), TodoConfiguration.SYMBOL_NEW_TASK);
            return;
        }

        this.updateTask(task.taskLine, task.getDescription(), TodoConfiguration.SYMBOL_DONE_TASK, TodoDocument.ACTION_DONE);
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
            this.updateTask(task.taskLine, task.getDescription(), TodoConfiguration.SYMBOL_NEW_TASK);
            return;
        }

        this.updateTask(task.taskLine, task.getDescription(), TodoConfiguration.SYMBOL_CANCEL_TASK, TodoDocument.ACTION_CANCELLED);
    }

    private updateTask(taskLine: TextLine, taskDescription: string, symbol: string, tag?: string) {
        this._textEditorEdit.delete(new Range(new Position(taskLine.lineNumber, taskLine.firstNonWhitespaceCharacterIndex), taskLine.range.end));

        var timestamp = new Date();  
        var dateOptions = TodoConfiguration.DATE_UTC ? { timeZone: "UTC", timeZoneName: "short" } : {};      

        var showDate = TodoConfiguration.DATE_SHOW;
        var tagText = " " + TodoDocument.toTag(tag)+ (showDate ? (' (' + timestamp.toLocaleString(undefined, dateOptions) + ')'): "" );
        var newLine = symbol + " " + taskDescription + (tag ? (tagText): "");
        
        this.insertTask(new Position(taskLine.lineNumber, taskLine.firstNonWhitespaceCharacterIndex), newLine);
    }

    private insertTask(pos: Position, task: string) {
        this._textEditorEdit.insert(pos, task);
        new TodoDocumentDecorator(this._textEditor).performDecoration();
    }
}
