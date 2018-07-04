import { reduce } from 'lodash';
import { ArrayDiffTool } from './array/diff';
import { DiffLevel, DiffTool, Document, DocumentDiff } from './model';

const lineDiffTool = new ArrayDiffTool({
    excerptMapper: document => document.lines,
    level: DiffLevel.Textual,
    similarityThreshold: 0,
});
export const lineDiff = lineDiffTool.run;

const characterDiffTool = new ArrayDiffTool({
    excerptMapper: document => document.characters,
    level: DiffLevel.Textual,
    similarityThreshold: 1,
});
export const characterDiff = characterDiffTool.run;

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
