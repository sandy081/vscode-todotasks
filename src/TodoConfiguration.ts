'use strict';

import { workspace} from 'vscode';

export class TodoConfiguration {
    public static SYMBOL_NEW_TASK= "☐";
    public static SYMBOL_DONE_TASK= "✔";
    public static SYMBOL_CANCEL_TASK= "✘";

    public updateConfig()
    {
        TodoConfiguration.SYMBOL_NEW_TASK = workspace.getConfiguration('todotasks').get('newTaskSymbol');
        TodoConfiguration.SYMBOL_DONE_TASK = workspace.getConfiguration('todotasks').get('doneTaskSymbol');
        TodoConfiguration.SYMBOL_CANCEL_TASK = workspace.getConfiguration('todotasks').get('cancelTaskSymbol');
    }

}