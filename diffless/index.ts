import { curry } from 'lodash';
import { arrayDiff } from './array-diff';
import { dynamicProgrammingLCS } from './lcs';
import { DiffLevel, Document, DocumentDiff, Excerpt } from './model';

export const charactersDiff: (left: Document, right: Document) => DocumentDiff = curry(arrayDiff)({
    equal: Excerpt.sameContent,
    itemMapper: (d: Document) => d.characters,
    lcs: dynamicProgrammingLCS,
    lcsThreshold: 1,
    level: DiffLevel.Textual,
});
