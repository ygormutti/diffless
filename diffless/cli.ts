import { readFileSync } from 'fs';
import { charactersDiff } from './array-diff';
import { buildAnnotatedHTML } from './html';
import { dynamicProgrammingLCS } from './lcs';
import { Change, ChangeLevel, ChangeType, Document, Location } from './model';

export function annotateWithDiff(leftPath: string, rightPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const changes = charactersDiff(
        dynamicProgrammingLCS,
        left,
        right,
    );

    return buildAnnotatedHTML(left, right, changes);
}

function readTextFile(path: string, encoding: string = 'utf8') {
    return readFileSync(path, { encoding });
}

export function annotateWithChangesFile(leftPath: string, rightPath: string, changesPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const jsonChanges = JSON.parse(readTextFile(changesPath)) as JsonChange[];
    const changes = jsonChanges.map(c => toChange(c));

    return buildAnnotatedHTML(left, right, changes);
}

interface JsonChange {
    right?: Location;
    left?: Location;
    level: keyof typeof ChangeLevel;
    type: keyof typeof ChangeType;
}

function toChange(objFromJson: JsonChange): Change {
    return {
        ...objFromJson,
        level: ChangeLevel[objFromJson.level],
        type: ChangeType[objFromJson.type],
    };
}
