import { Change, Location, Position } from './model';

export class ChangeIndex {
    private index: Change[][][];

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

    get(position: Position): Change[] {
        const { line, character } = position;
        if (!this.index[line] || !this.index[line][character]) { return []; }
        return this.index[line][character];
    }
}

export function intEnumKeys(E: any): string[] {
    return Object.keys(E).filter(k => typeof E[k as any] === 'number');
}

/**
 * Allows Scala-like stripMargin
 *
 * Parameters are applied implicitly via ES2015.
 *
 * @example
 * // returns "The Number is:\n    100\nThanks for playing!"
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * get the gist: https://gist.github.com/jimschubert/06fea56a6d2a1e7fdbc2
 */
export function stripMargin(template: TemplateStringsArray, ...expressions: any[]) {
    const result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });

    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}
