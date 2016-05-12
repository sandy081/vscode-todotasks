'use strict';

import { commands, TextEditor, TextEditorEdit, CompletionItem, TextEdit} from 'vscode';
import { TodoDocument } from './TodoDocument';
import { TodoDocumentEditor } from './TodoDocumentEditor';

export class TodoCommands {
    
    public static NEW_TASK= "task.new";
    public static COMPLETE_TASK= "task.complete";
    public static CANCEL_TASK= "task.cancel";

    public registerNewTaskCommand() {
        return commands.registerTextEditorCommand(TodoCommands.NEW_TASK, (textEditor: TextEditor, edit: TextEditorEdit) => {
            new TodoDocumentEditor(textEditor, edit).createNewTask();
        });
    }

    public registerCompleteTaskCommand() {
        return commands.registerTextEditorCommand(TodoCommands.COMPLETE_TASK, (textEditor: TextEditor, edit: TextEditorEdit) => {
            new TodoDocumentEditor(textEditor, edit).completeCurrentTask();
        });
    }

    public registerCancelTaskCommand() {
        return commands.registerTextEditorCommand(TodoCommands.CANCEL_TASK, (textEditor: TextEditor, edit: TextEditorEdit) => {
            new TodoDocumentEditor(textEditor, edit).cancelCurrentTask();
        });
    }
}

interface CommandObject {
    label: string;
    command: string; 
}

export class TodoCommandsProvider {

    private static COMMANDS: CommandObject[]= [{label: TodoDocument.toTag(TodoDocument.ACTION_DONE), command: "Ctrl+Shift+d"},
                                    {label: TodoDocument.toTag(TodoDocument.ACTION_CANCELLED), command: "Ctrl+Shift+c"}];

    public static getCommands(filter?: string):Promise<CompletionItem[]> {
        let filtered= TodoCommandsProvider.COMMANDS.filter((commandObject: CommandObject, index: number, collection: CommandObject[]): boolean =>{
                            return !filter || commandObject.label.indexOf(filter) !== -1
                        });
        let result= filtered.map((commandObject: CommandObject, index: number, collection: CommandObject[]): CompletionItem =>{
                            var completionItem= new CompletionItem(commandObject.label);
                            return completionItem;
                        });
        return Promise.resolve(result);
    } 
}