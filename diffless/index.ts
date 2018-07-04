import { ArrayDiffTool } from './array/diff';
import { DiffLevel } from './model';

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
