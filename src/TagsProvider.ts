'use strict';

import {CompletionItem} from 'vscode';
import {TodoDocument} from './TodoDocument';

export class TagsProvider {

    private static TAGS: string[]= [TodoDocument.TAG_CRITICAL,
                                    TodoDocument.TAG_HIGH,
                                    TodoDocument.TAG_LOW,
                                    TodoDocument.TAG_TODAY];

    public static getTags(prefix?: string):Promise<CompletionItem[]> {
        prefix= prefix && prefix !== TodoDocument.SYMBOL_TAG 
                                ? prefix.startsWith(TodoDocument.SYMBOL_TAG) ? prefix.substring(1) : prefix.toLocaleLowerCase()
                                : "";
        let filtered= TagsProvider.TAGS.filter((tag: string, index: number, collection: String[]): boolean =>{
                            return !prefix || tag.toLocaleLowerCase().indexOf(prefix) !== -1
                        });
        let result= filtered.map(this.toCompletionItem);
        return Promise.resolve(result);
    } 

    private static toCompletionItem(tag: string, index: number, collection: String[]):CompletionItem {
        tag= TodoDocument.toTag(tag);
        var completionItem= new CompletionItem(tag);
        completionItem.insertText= tag + " ";
        return completionItem;
    }
}