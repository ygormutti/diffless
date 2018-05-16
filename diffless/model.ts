/**
 * Model classes and interfaces.
 *
 * Design and docs inspired by: https://microsoft.github.io/language-server-protocol/specification
 */

/**
 * The URI of a document
 */
export type DocumentUri = string;

/**
 * The end of line sequence adopted for internal use
 */
export const EOL = '\n';

/**
 * Position in a text document expressed as one-based line and one-based character offset.
 *
 * A position is between two characters like an ‘insert’ cursor in a editor.
 */
export class Position {
    constructor(
        /**
         * Line position in a document (one-based).
         */
        readonly line: number,

        /**
         * Character offset on a line in a document (one-based). Assuming that the line is
         * represented as a string, the `character` value represents the gap between the
         * `character` and `character + 1`.
         *
         * If the character value is greater than the line length it defaults back to the
         * line length.
         */
        readonly character: number,
    ) { }

    equals(other: Position) {
        return this.line === other.line && this.character === other.character;
    }

    toString() {
        return `${this.line}:${this.character}`;
    }
}

/**
 * A range in a text document expressed as (one-based) start and end positions.
 *
 * A range is comparable to a selection in an editor. Therefore the end position is exclusive.
 * If you want to specify a range that contains a line including the line ending character(s)
 * then use an end position denoting the start of the next line.
 */
export class Range {
    constructor(
        /**
         * The range's start position.
         */
        readonly start: Position,

        /**
         * The range's end position.
         */
        readonly end: Position,
    ) { }

    toString() {
        return `[${(this.start.toString())}; ${this.end.toString()})`;
    }
}

/**
 * An object which has a range field
 */
export interface Ranged {
    range: Range;
}

/**
 * A text document
 */
export class Document {
    readonly lines: string[];
    readonly characters: Character[];

    constructor(
        readonly uri: string,
        readonly content: string,
    ) {
        this.lines = normalizeEOLs(content).split(EOL);
        this.characters = buildCharacters(this.lines);
    }

    getCharacterAt(position: Position): string {
        const line = this.lines[position.line - 1];
        return position.character > line.length ? EOL : line[position.character - 1];
    }
}

function buildCharacters(lines: string[]): Character[] {
    const characters: Character[] = [];
    for (const [lineOffset, line] of lines.entries()) {
        const lineNumber = lineOffset + 1;
        for (const [characterOffset, character] of Array.from(line).entries()) {
            characters.push(new Character(character, new Position(lineNumber, characterOffset + 1)));
        }
        characters.push(new Character(EOL, new Position(lineNumber, line.length + 1)));
    }
    return characters;
}

function normalizeEOLs(content: string): string {
    return content.replace('\r\n', EOL).replace('\r', EOL);
}

export class Character implements Ranged {
    readonly range: Range;

    constructor(
        readonly value: string,
        readonly position: Position,
    ) {
        const end = value === EOL ?
            new Position(position.line + 1, 1) :
            new Position(position.line, position.character + 1);
        this.range = new Range(position, end);
    }

    equals(that: Character) {
        return this.value === that.value;
    }

    static equal(a: Character, b: Character) {
        return a.equals(b);
    }
}

export class Location {
    constructor(
        readonly uri: DocumentUri,
        readonly range: Range,
    ) { }
}

export enum ChangeType {
    Add,
    Delete,
    Edit,
    Move,
    Copy,
    Rename,
}

export enum ChangeLevel {
    Binary,
    Textual,
    Lexical,
    Semantic,
}

export class Change {
    constructor(
        readonly level: ChangeLevel,
        readonly type: ChangeType,
        readonly left?: Location,
        readonly right?: Location,
    ) { }
}

export class Diff {
    constructor(
        readonly left: Document,
        readonly right: Document,
        readonly changes: Set<Change>,
    ) { }
}
