'use strict';

import { window, TextEditor, Range, Position, TextLine, TextDocumentChangeEvent, TextEditorDecorationType } from 'vscode';
import {TodoDocument, Task} from './TodoDocument';

export default class TodoDocumentEditor {

    private timeout:number= null;

    constructor(private _textEditor: TextEditor) {
    }

    public performDecoration(delayed?: boolean) {
        if (delayed) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(()=>{this.doPerform();}, 200);
        } else {
            this.doPerform();
        }
    }

    private doPerform() {
        var todoDocument= new TodoDocument(this._textEditor.document);
        var decorationTypes= new TaskDecorator().getDecorationTypes(todoDocument.getTasks());
        decorationTypes.forEach((decorationTypeWithRanges: DecorationTypeWithRanges) => {
             if (decorationTypeWithRanges.ranges.length !== 0) {
                this._textEditor.setDecorations(decorationTypeWithRanges.decorationType, decorationTypeWithRanges.ranges);
             }  
        }, this);
    }
}

interface DecorationTypeWithRanges {
    decorationType: TextEditorDecorationType,
    ranges: Range[]
}

class LineDecorator {
    protected getRange(text: string, line: TextLine): Range {
        let start:Position= line.range.start;
        let lineText:string= line.text;
        let symbolIndex:number= lineText.indexOf(text);
        let startPositionToDecorate= new Position(start.line, symbolIndex);
        let endPositionToDecorate= new Position(start.line, symbolIndex + text.length);
        return new Range(startPositionToDecorate, endPositionToDecorate);
    }    
}

class TaskDecorator {
    public getDecorationTypes(tasks: Task[]): DecorationTypeWithRanges[] {
        var result: DecorationTypeWithRanges[]= [];
        result= result.concat(new DoneTasksDecorator().getDecorationTypes(tasks));
        result= result.concat(new CancelTasksDecorator().getDecorationTypes(tasks));
        result= result.concat(new TagsDecorator().getDecorationTypes(tasks));
        return result;
    }
}

class DoneTasksDecorator extends LineDecorator {
    
    private static DECORATOR_DONE_SYMBOL= window.createTextEditorDecorationType({
        light: {
			color: '#00723e',
            
		},
		dark: {
			color: '#00723e',
		}
    });

    private static DECORATOR_DONE_ACTION= window.createTextEditorDecorationType({
        light: {
			color: '#ccc',
		},
		dark: {
			color: '#7D7D7D',
		}
    });

    private static DECORATOR_TAG= window.createTextEditorDecorationType({
        light: {
			color: '#ccc',
		},
		dark: {
			color: '#7D7D7D',
		}
    });

    public getDecorationTypes(tasks: Task[]): DecorationTypeWithRanges[] {
        var doneSymbolRanges:Range[]= []
        var doneActionRanges:Range[]= []
        var tagsRanges:Range[]= []
        tasks.forEach((task:Task) => {
            if (task.isDone()) {
                doneSymbolRanges.push(this.getDoneSymbolRange(task));
                tagsRanges= tagsRanges.concat(task.getTagsRanges());
                doneActionRanges.push(this.getDoneActionRange(task));
            }
        }, this);
        return [{decorationType: DoneTasksDecorator.DECORATOR_DONE_SYMBOL, ranges: doneSymbolRanges},
                {decorationType: DoneTasksDecorator.DECORATOR_TAG, ranges: tagsRanges},
                {decorationType: DoneTasksDecorator.DECORATOR_DONE_ACTION, ranges: doneActionRanges}];
    }

    private getDoneSymbolRange(doneTask: Task): Range {
        return super.getRange(TodoDocument.SYMBOL_DONE_TASK, doneTask.taskLine);
    }

    private getDoneActionRange(doneTask: Task): Range {
        return super.getRange(TodoDocument.toTag(TodoDocument.ACTION_DONE), doneTask.taskLine);
    }
}

class CancelTasksDecorator extends LineDecorator {
    
    private static DECORATOR_CANCEL_SYMBOL= window.createTextEditorDecorationType({
        light: {
			color: 'red',
		},
		dark: {
			color: 'red',
		}
    });

    private static DECORATOR_CANCEL_ACTION= window.createTextEditorDecorationType({
        light: {
			color: '#ccc',
		},
		dark: {
			color: '#7D7D7D',
		}
    });

    private static DECORATOR_TAG= window.createTextEditorDecorationType({
        light: {
			color: '#ccc',
		},
		dark: {
			color: '#7D7D7D',
		}
    });

    public getDecorationTypes(tasks: Task[]): DecorationTypeWithRanges[] {
        var doneSymbolRanges:Range[]= [];
        var doneActionRanges:Range[]= [];
        var tagsRanges:Range[]= [];

        tasks.forEach((task:Task) => {
            if (task.isCancelled()) {
                doneSymbolRanges.push(this.getCancelSymbolRange(task));
                tagsRanges= tagsRanges.concat(task.getTagsRanges());
                doneActionRanges.push(this.getCancelActionRange(task));
            }
        }, this);

        return [{decorationType: CancelTasksDecorator.DECORATOR_CANCEL_SYMBOL, ranges: doneSymbolRanges},
                {decorationType: CancelTasksDecorator.DECORATOR_TAG, ranges: tagsRanges},
                {decorationType: CancelTasksDecorator.DECORATOR_CANCEL_ACTION, ranges: doneActionRanges}];
    }

    private getCancelSymbolRange(doneTask: Task): Range {
        return super.getRange(TodoDocument.SYMBOL_CANCEL_TASK, doneTask.taskLine);
    }

    private getCancelActionRange(doneTask: Task): Range {
        return super.getRange(TodoDocument.toTag(TodoDocument.ACTION_CANCELLED), doneTask.taskLine);
    }
}

class TagsDecorator extends LineDecorator {
    
    private static DECORATOR_CRITICAL_TAG= window.createTextEditorDecorationType({
        backgroundColor: '#FF0000',
        color: '#000'
    });

    private static DECORATOR_HIGH_TAG= window.createTextEditorDecorationType({
        backgroundColor: '#FF7F00',
        color: '#000'
    });

    private static DECORATOR_LOW_TAG= window.createTextEditorDecorationType({
        light: {
            backgroundColor: '#000',
            color: '#fff'
		},
		dark: {
			backgroundColor: '#fff',
            color: '#000',
		}
    });

    private static DECORATOR_TODAY_TAG= window.createTextEditorDecorationType({
        light: {
            backgroundColor: '#EADD4E',
            color: '#000'
		},
		dark: {
			backgroundColor: '#EADD4E',
            color: '#000',
		}
    });

    public getDecorationTypes(tasks: Task[]): DecorationTypeWithRanges[] {
        var criticalTagRanges:Range[]= []
        var highTagRanges:Range[]= []
        var lowTagRanges:Range[]= []
        var todayTagRanges:Range[]= []
        tasks.forEach((task:Task) => {
            if (!task.isCancelled() && !task.isDone()) {
                criticalTagRanges= criticalTagRanges.concat(task.getTagRanges(TodoDocument.TAG_CRITICAL));
                highTagRanges= highTagRanges.concat(task.getTagRanges(TodoDocument.TAG_HIGH));
                lowTagRanges= lowTagRanges.concat(task.getTagRanges(TodoDocument.TAG_LOW));
                todayTagRanges= todayTagRanges.concat(task.getTagRanges(TodoDocument.TAG_TODAY));
            }
        }, this);
        return [{decorationType: TagsDecorator.DECORATOR_CRITICAL_TAG, ranges: criticalTagRanges},
                {decorationType: TagsDecorator.DECORATOR_HIGH_TAG, ranges: highTagRanges},
                {decorationType: TagsDecorator.DECORATOR_TODAY_TAG, ranges: todayTagRanges},
                {decorationType: TagsDecorator.DECORATOR_LOW_TAG, ranges: lowTagRanges}];
    }
}