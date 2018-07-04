import { curry } from 'lodash';
import { arrayDiff, ArrayDiffOptions } from './array/diff';
import { DiffLevel, Document, DocumentDiff } from './model';

const lineOptions = new ArrayDiffOptions(DiffLevel.Textual, d => d.lines, 0);
export const lineDiff: (left: Document, right: Document) => DocumentDiff =
    curry(arrayDiff)(lineOptions);

const characterOptions = new ArrayDiffOptions(DiffLevel.Textual, d => d.characters, 1);
export const characterDiff: (left: Document, right: Document) => DocumentDiff =
    curry(arrayDiff)(characterOptions);
