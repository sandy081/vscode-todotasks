'use strict';

import { workspace} from 'vscode';

export class TodoConfiguration {
    public static SYMBOL_NEW_TASK= "☐";
    public static SYMBOL_DONE_TASK= "✔";
    public static SYMBOL_CANCEL_TASK= "✘";

    public static DATE_SHOW = true;
    public static DATE_UTC = false;
    
    public updateConfig()
    {
        TodoConfiguration.DATE_SHOW = <boolean> workspace.getConfiguration('todotasks').get('showDateOnDone');
        TodoConfiguration.DATE_UTC = <boolean> workspace.getConfiguration('todotasks').get('useUTCDate');
        TodoConfiguration.SYMBOL_NEW_TASK = <string> workspace.getConfiguration('todotasks').get('newTaskSymbol');
        TodoConfiguration.SYMBOL_DONE_TASK = <string> workspace.getConfiguration('todotasks').get('doneTaskSymbol');
        TodoConfiguration.SYMBOL_CANCEL_TASK = <string> workspace.getConfiguration('todotasks').get('cancelTaskSymbol');
    }

}