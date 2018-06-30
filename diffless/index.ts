import { curry } from 'lodash';
import { arrayDiff } from './array-diff';
import { dynamicProgrammingLCS } from './lcs';
import { Character, DiffLevel, Document, DocumentDiff } from './model';

export const charactersDiff: (left: Document, right: Document) => DocumentDiff = curry(arrayDiff)({
    equal: Character.equal,
    itemMapper: (d: Document) => d.characters,
    lcs: dynamicProgrammingLCS,
    lcsThreshold: 1,
    level: DiffLevel.Textual,
});
