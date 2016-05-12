'use strict';

import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, Range } from 'vscode';
import TagsProvider from './TagsProvider'

export default class TodoCompletionItemProvider implements CompletionItemProvider {
    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> {
        var range  = document.getWordRangeAtPosition(position);
		var prefix = range ? document.getText(range) : '';
        return TagsProvider.getTags(prefix);
    }
}