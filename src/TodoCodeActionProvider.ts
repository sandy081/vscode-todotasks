'use strict';

import { CodeActionProvider, CodeActionContext, TextDocument, Position, CancellationToken, Command, Range } from 'vscode';
import { TodoDocument, Task } from './TodoDocument';

export default class TodoCodeActionProvider implements CodeActionProvider {
    
    public provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Command[] | Thenable<Command[]> {
        let todoDocument= new TodoDocument(document);
        
        if (todoDocument.getProject(range.start)) {
            // No code actions on a project
            return [];
        }

        let task= todoDocument.getTask(range.start);
        if (task) {
            if(task.isDone()) {
                return this.getDoneTaskCodeActions(task);
            }
            if (task.isCancelled()) {
                return this.getCancelledTaskCodeActions(task);
            }
            return this.getPendingTaskCodeActions(task);
        }

        let taskDescription= document.lineAt(range.start).text.trim();
        return this.getNewTaskCodeActions(taskDescription);
    }

    private getNewTaskCodeActions(taskDescription: string):Command[] {
        if (taskDescription) {
            return [{
                'title': "Convert to a task",
                'command': "task.new" 
            }]; 
        }
        return [{
            'title': "Create a task",
            'command': "task.new" 
        }]; 
    }

    private getPendingTaskCodeActions(task: Task):Command[] {
        if (task.isEmpty()) {
            return [];
        }
        return [{
            'title': "Complete the task",
            'command': "task.complete" 
        },{
            'title': "Cancel the task",
            'command': "task.cancel" 
        }]; 
    }

    private getDoneTaskCodeActions(doneTask: Task):Command[] {
        return [{
            'title': "Make task pending",
            'command': "task.complete" 
        }]; 
    }

    private getCancelledTaskCodeActions(doneTask: Task):Command[] {
        return [{
            'title': "Complete the task",
            'command': "task.complete" 
        }]; 
    } 
}