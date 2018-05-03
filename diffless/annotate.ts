import * as fs from 'fs';
import { partition } from 'lodash';

import { Change, ChangeLevel, ChangeType, Document, Location, Position } from './model';

const { argv } = process;

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

const left = new Document("string:left", readTextFile(argv[2]));
const right = new Document("string:right", readTextFile(argv[3]));

const jsonChanges = JSON.parse(readTextFile(argv[4])) as Array<JsonChange>;
const changes = jsonChanges.map(c => toChange(c));

class ChangeIndex {
    private index: Array<Array<Array<Change>>>;

    constructor() {
        this.index = [];
    }

    public add(location: Location, change: Change) {
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

    public get(position: Position): Array<Change> {
        const { line, character } = position;
        if (!this.index[line] || !this.index[line][character]) { return []; }
        return this.index[line][character];
    }
}

const leftChangeIndex = new ChangeIndex();
const rightChangeIndex = new ChangeIndex();
changes.forEach(change => {
    const { left, right } = change;
    if (left) { leftChangeIndex.add(left, change); }
    if (right) { rightChangeIndex.add(right, change); }
});

function generatePreCode(document: Document, changeIndex: ChangeIndex) {
    const lines = document.content.split('\n');
    const pendingChanges = new Set();
    let html = `<pre class="${document.uri.replace(':', '_')}"><code>`;

    for (const [lineIndex, line] of lines.entries()) {
        for (const [characterIndex, character] of line.split('').entries()) {
            const position = { line: lineIndex + 1, character: characterIndex + 1 };
            const changesHere = changeIndex.get(position);
            const [ending, starting] = partition(changesHere, c => pendingChanges.has(c));

            for (const change of ending) {
                pendingChanges.delete(change);
                html += '</span>';
            }

            for (const change of starting) {
                pendingChanges.add(change);
                html += `<span class="${ChangeLevel[change.level]} ${ChangeType[change.type]}">`;
            }

            html += character;
        }

        // FIXME DRY
        const position = { line: lineIndex + 1, character: line.length + 1 };
        const changesHere = changeIndex.get(position);

        const [ending, starting] = partition(changesHere, c => pendingChanges.has(c));

        for (const change of ending) {
            pendingChanges.delete(change);
            html += '</span>';
        }

        for (const change of starting) {
            pendingChanges.add(change);
            html += `<span class="${ChangeLevel[change.level]} ${ChangeType[change.type]}">`;
        }
        // FIXME DRY

        html += '<br/>\n';
    }
    html += '</code></pre>';
    return html;
}

const leftPreCode = generatePreCode(left, leftChangeIndex);
const rightPreCode = generatePreCode(right, rightChangeIndex);

const finalHtml = `<html>
<body>
<style>

.Textual {
    display:none;
}
  .Add {
    background-color: rgba(0,255,0,0.3);
  }

  .Delete {
    background-color: rgba(255,0,0,0.3);
  }

  .Move {
    background-color: rgba(0,0,255,0.3);
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

console.log(finalHtml);
