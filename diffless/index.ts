import { curry } from 'lodash';
import { arrayDiff } from './array-diff';
import { dynamicProgrammingLCS } from './lcs';
import { Change, ChangeLevel, Character, Document } from './model';

export const charactersDiff: (left: Document, right: Document) => Change[] = curry(arrayDiff)({
    equal: Character.equal,
    itemMapper: (d: Document) => d.characters,
    lcs: dynamicProgrammingLCS,
    lcsThreshold: 1,
    level: ChangeLevel.Textual,
});
