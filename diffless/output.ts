import * as fs from 'fs';
import { partition } from 'lodash';

import { arrayDiff, ArrayDiffArgument } from './array_diff';
import { dynamicProgrammingLCS } from './lcs';
import { Change, ChangeLevel, ChangeType, Character, Document, Location, Position } from './model';

class ChangeIndex {
    private index: Array<Array<Array<Change>>>;

    constructor() {
        this.index = [];
    }

    add(location: Location, change: Change) {
        const { start, end } = location.range;
        this.addToPosition(start, change);
        this.addToPosition(end, change);
    }

    private addToPosition(position: Position, change: Change) {
        const { line, character } = position;
        if (!this.index[line]) { this.index[line] = []; }

        let changes = this.index[line][character];
        if (!changes) {
            changes = [];
            this.index[line][character] = changes;
        }

        changes.push(change);

        // sort by level
        changes.sort((a, b) => {
            return ((a.level * 100) - (b.level * 100)) + (a.type - b.type);
        });
    }

    get(position: Position): Array<Change> {
        const { line, character } = position;
        if (!this.index[line] || !this.index[line][character]) { return []; }
        return this.index[line][character];
    }
}

function buildAnnotatedDocumentHTML(document: Document, changeIndex: ChangeIndex) {
    const { lines, uri } = document;
    const pendingChanges = new Set();
    let html = `<pre class="${uri.replace(':', '_')}"><code>`;

    for (const [lineOffset, line] of lines.entries()) {
        const lineNumber = lineOffset + 1;

        for (const [characterOffset, character] of Array.from(line).entries()) {
            const position = new Position(lineNumber, characterOffset + 1);
            html += buildPositionTags(position, changeIndex, pendingChanges);
            html += character;
        }

        const lineEndPosition = new Position(lineNumber, line.length + 1);
        html += buildPositionTags(lineEndPosition, changeIndex, pendingChanges);
        html += '<br/>\n';
    }
    html += '</code></pre>';
    return html;
}

function buildPositionTags(
    position: Position,
    changeIndex: ChangeIndex,
    pendingChanges: Set<any>,
) {
    const changesHere = changeIndex.get(position);
    const [ending, starting] = partition(changesHere, c => pendingChanges.has(c));
    let html = '';
    for (const change of ending) {
        pendingChanges.delete(change);
        html += '</span>';
    }
    for (const change of starting) {
        pendingChanges.add(change);
        html += `<span class="${ChangeLevel[change.level]} ${ChangeType[change.type]}">`;
    }
    return html;
}

export function buildAnnotatedHTML(
    leftDocument: Document,
    rightDocument: Document,
    changes: Change[],
    threshold: ChangeLevel = ChangeLevel.Binary,
) {
    const leftChangeIndex = new ChangeIndex();
    const rightChangeIndex = new ChangeIndex();
    changes.forEach(change => {
        const { left, right } = change;
        if (left) { leftChangeIndex.add(left, change); }
        if (right) { rightChangeIndex.add(right, change); }
    });

    const leftPreCode = buildAnnotatedDocumentHTML(leftDocument, leftChangeIndex);
    const rightPreCode = buildAnnotatedDocumentHTML(rightDocument, rightChangeIndex);

    return `<html>
<body>
<style>
    .Add {
        background-color: rgba(0,255,0,0.3);
    }

    .Delete {
        background-color: rgba(255,0,0,0.3);
    }

    .Move {
        background-color: rgba(0,0,255,0.3);
    }

    .${ChangeLevel[threshold]} {
        background-color: rgba(0,0,0,-0.3);
    }

    .string_left {
        width: 50%;
        float: left;
    }
</style>
${leftPreCode}
${rightPreCode}
</body>
</html>`;
}

function annotateWithChangesFile(leftPath: string, rightPath: string, changesPath: string) {
    const { argv } = process;
    const left = new Document("string:left", readTextFile(leftPath));
    const right = new Document("string:right", readTextFile(rightPath));

    const jsonChanges = JSON.parse(readTextFile(argv[4])) as Array<JsonChange>;
    const changes = jsonChanges.map(c => toChange(c));

    return buildAnnotatedHTML(left, right, changes);
}

function readTextFile(path: string, encoding: string = 'utf8') {
    return fs.readFileSync(path, { encoding });
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

export function annotateWithDiff(leftPath: string, rightPath: string) {
    const left = new Document("string:left", readTextFile(leftPath));
    const right = new Document("string:right", readTextFile(rightPath));

    const changes = arrayDiff(
        dynamicProgrammingLCS,
        ChangeLevel.Textual,
        Character.equal,
        new ArrayDiffArgument(left.uri, left.characters),
        new ArrayDiffArgument(right.uri, right.characters),
    );

    return buildAnnotatedHTML(left, right, changes);
}

// const { argv } = process;
// annotateWithDiff(argv[2], argv[3], argv[4]);