'use strict';

import {TextDocument, TextLine, Position, CompletionItem, Range} from 'vscode';
import {getStatus} from './TodoStatus';

export class TodoDocument {
    
    public static SYMBOL_PROJECT= ":";
    public static SYMBOL_NEW_TASK= "☐";
    public static SYMBOL_DONE_TASK= "✔";
    public static SYMBOL_CANCEL_TASK= "✘";
    public static SYMBOL_TAG= "@";

    public static TAG_CRITICAL= "critical";
    public static TAG_HIGH= "high";
    public static TAG_LOW= "low";
    public static TAG_TODAY= "today";

    public static ACTION_DONE= "done";
    public static ACTION_CANCELLED= "cancelled";

    constructor(private _textDocument: TextDocument) {
        getStatus().reset();
        let s = this.getTasks();
    }

    public getProject(pos: Position): Project {
        let line= this._textDocument.lineAt(pos.line)
        let projectText= line.text.trim();
        if (projectText.endsWith(TodoDocument.SYMBOL_PROJECT)) {
            getStatus().upProjects();
            return new Project(line);
        }
        return null;
    }

    public getTasks(): Task[] {
        let result: Task[]= [];
        var text= this._textDocument.getText();
        var regEx= /^\s*[☐|✘|✔]/gm;
        var match;
        while (match = regEx.exec(text)) {
            let line= this._textDocument.lineAt(this._textDocument.positionAt(match.index + 1).line);
            let _ = new Task(line);
            getStatus().upTodo();
            if(_.isDone())
                getStatus().upDone();
            result.push(_);
        }
        return result;
    }

    public getTask(pos: Position): Task {
        if (!this.isTask(pos)) {
            return null;
        }

        let line= this._textDocument.lineAt(pos.line);
        return new Task(line);
    }

    public isTask(pos: Position): boolean {
        let task= this._textDocument.lineAt(pos.line).text.trim();
        return task.startsWith(TodoDocument.SYMBOL_NEW_TASK) 
                    || task.startsWith(TodoDocument.SYMBOL_CANCEL_TASK)
                    || task.startsWith(TodoDocument.SYMBOL_DONE_TASK);
    }

    public static toTag(tagName: string): string {
        return TodoDocument.SYMBOL_TAG + tagName;
    }
}

export class Task {
    
    private taskText: string;

    constructor(public taskLine: TextLine) {
        this.taskText= taskLine.text.trim();
    }

    public getDescription(): string {
        if (this.isDone()) {
            let index= this.taskText.indexOf(TodoDocument.toTag(TodoDocument.ACTION_DONE));
            return index !== -1 ? this.taskText.substring(TodoDocument.SYMBOL_DONE_TASK.length, index).trim()
                                       : this.taskText.substring(TodoDocument.SYMBOL_DONE_TASK.length).trim();
        }
        if (this.isCancelled()) {
            var index= this.taskText.indexOf(TodoDocument.toTag(TodoDocument.ACTION_CANCELLED));
            return index !== -1 ? this.taskText.substring(TodoDocument.SYMBOL_CANCEL_TASK.length, index).trim()
                                       : this.taskText.substring(TodoDocument.SYMBOL_CANCEL_TASK.length).trim();
        }
        return this.taskText.substring(TodoDocument.SYMBOL_NEW_TASK.length).trim();
    }

    public isEmpty(): boolean {
        return !this.getDescription().trim();
    }

    public isDone(): boolean {
        return this.taskText.indexOf(TodoDocument.SYMBOL_DONE_TASK) !== -1;
    }

    public isCancelled(): boolean {
        return this.taskText.indexOf(TodoDocument.SYMBOL_CANCEL_TASK) !== -1;
    }

    public hasTag(tag: string): boolean {
        return this.taskText.toLocaleLowerCase().indexOf(TodoDocument.toTag(tag).toLocaleLowerCase()) !== -1;
    }

    public getTagRanges(tag: string): Range[] {
        var result:Range[]= [];
        var regEx= /@[^@\s]+/g  ;
        var match;
        while (match = regEx.exec(this.taskText)) {
            if (TodoDocument.toTag(tag).toLocaleLowerCase() === match[0].toLocaleLowerCase()) {
                let start:Position= this.taskLine.range.start;
                let lineText:string= this.taskLine.text;
                let startPosition= new Position(start.line, this.taskLine.firstNonWhitespaceCharacterIndex + match.index);
                let endPosition= new Position(start.line, this.taskLine.firstNonWhitespaceCharacterIndex + match.index + match[0].length);
                result.push(new Range(startPosition, endPosition));
            }
        }
        return result;
    }

    public getTags(): string[] {
        var result= [];
        var regEx= /@[^@\s]+/g  ;
        var match;
        while (match = regEx.exec(this.taskText)) {
            if (TodoDocument.toTag(TodoDocument.ACTION_CANCELLED) !== match[0] && TodoDocument.toTag(TodoDocument.ACTION_DONE) !== match[0]) {
                result.push(match[0]);
            }
        }
        return result;

    }

    public getTagsRanges(): Range[] {
        var result:Range[]= [];
        var regEx= /@[^@\s]+/g  ;
        var match;
        while (match = regEx.exec(this.taskText)) {
            if (TodoDocument.toTag(TodoDocument.ACTION_CANCELLED) !== match[0] && TodoDocument.toTag(TodoDocument.ACTION_DONE) !== match[0]) {
                let start:Position= this.taskLine.range.start;
                let lineText:string= this.taskLine.text;
                let startPosition= new Position(start.line, this.taskLine.firstNonWhitespaceCharacterIndex + match.index);
                let endPosition= new Position(start.line, this.taskLine.firstNonWhitespaceCharacterIndex + match.index + match[0].length);
                result.push(new Range(startPosition, endPosition));
            }
        }
        return result;
    }
}

export class Project {
    constructor(public line: TextLine) {
    }
}