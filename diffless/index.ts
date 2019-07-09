import { reduce } from 'lodash';
import { ArrayDiffTool } from './array/diff';
import {
    DEFAULT_CONTENT_TYPE, DiffLevel, DiffTool, DiffToolFactory, Document, DocumentDiff,
} from './model';

const lineDiffTool = new ArrayDiffTool({
    level: DiffLevel.Textual,
    similarityThreshold: 0,
    toAtomArray: document => document.lines,
});
export const lineDiff = lineDiffTool.compare;

const characterDiffTool = new ArrayDiffTool({
    level: DiffLevel.Textual,
    similarityThreshold: 1,
    toAtomArray: document => document.characters,
});
export const characterDiff = characterDiffTool.compare;

export function compose(...diffs: DiffTool[]): DiffTool {
    return (left: Document, right: Document) => {
        return reduce(diffs, (acc: DocumentDiff, diffTool: DiffTool) => {
            const documentDiff = diffTool(left, right);
            const edits = acc.edits.concat(documentDiff.edits);
            const similarities = acc.similarities.concat(documentDiff.similarities);
            return new DocumentDiff(left, right, edits, similarities);
        }, new DocumentDiff(left, right, [], []));
    };
}

const DIFF_TOOL_FACTORIES: { [contentType: string]: DiffToolFactory } = {};

export function registerDiffTool(contentType: string, diffToolFactory: DiffToolFactory): void {
    DIFF_TOOL_FACTORIES[contentType] = diffToolFactory;
}

registerDiffTool(DEFAULT_CONTENT_TYPE, _ => compose(lineDiff, characterDiff));

export function getDiffTool(contentType: string, options: any): DiffTool {
    if (contentType in DIFF_TOOL_FACTORIES) {
        return DIFF_TOOL_FACTORIES[contentType](options);
    }
    return getDiffTool(DEFAULT_CONTENT_TYPE, options);
}
