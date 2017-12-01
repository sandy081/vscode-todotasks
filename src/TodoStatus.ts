'use strict';

class StateContext{
    todo: number;
    done: number;
    projects: number;
    constructor(){
        this.todo = 0;
        this.done = 0;
        this.projects = 0;
    }
    reset(){
        this.todo = 0;
        this.done = 0;
        this.projects = 0;
    }
    upTodo(){
        this.todo++;
    }
    downTodo(){
        this.todo--;
    }
    upDone(){
        this.done ++;
    }
    downDone(){
        this.done--;
    }
    upProjects(){
        this.projects++;
    }
    downProjects(){
        this.projects--;
    }
}

let myState = null;

export function getStatus(){
    if(myState == null)
        myState = new StateContext();
    return myState;
}