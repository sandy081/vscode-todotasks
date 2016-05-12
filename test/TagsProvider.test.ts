import * as assert from 'assert';
import {expect} from 'chai';
import { CompletionItem } from 'vscode';
import TagsProvider from '../src/TagsProvider';

suite("TagsProvider Tests", () => {
    
    test("Tags provider return all tags when no prefix is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags();
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals.length).equals(4);
            expect(actuals[0].label).equals("@critical");
            expect(actuals[1].label).equals("@high");
            expect(actuals[2].label).equals("@low");
            expect(actuals[3].label).equals("@today");
            done();
        });
    });

    test("Tags provider return all tags when an empty prefix is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals.length).equals(4);
            expect(actuals[0].label).equals("@critical");
            expect(actuals[1].label).equals("@high");
            expect(actuals[2].label).equals("@low");
            expect(actuals[3].label).equals("@today");
            done();
        });
    });

    test("Tags provider return all tags when '@' is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("@");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals.length).equals(4);
            expect(actuals[0].label).equals("@critical");
            expect(actuals[1].label).equals("@high");
            expect(actuals[2].label).equals("@low");
            expect(actuals[3].label).equals("@today");
            done();
        });
    });

    test("Tags provider return filtered tags when prefix without @ is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("c");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals.length).equals(1);
            expect(actuals[0].label).equals("@critical");
            done();
        });
    });

    test("Tags provider return filtered tags when prefix with @ is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("@t");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals.length).equals(2);
            expect(actuals[0].label).equals("@critical");
            expect(actuals[1].label).equals("@today");
            done();
        });
    });

    test("Tags provider return no tags when unmatching prefix without @ is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("hello");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals).is.empty;
            done();
        });
    });

    test("Tags provider return no tags when unmatching prefix with @ is passed", (done) => {
        let promise:Promise<CompletionItem[]>= TagsProvider.getTags("@hello");
        promise.then((actuals: CompletionItem[]) => {
            expect(actuals).is.empty;
            done();
        });
    });

});