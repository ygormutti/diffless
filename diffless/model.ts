export type DocumentUri = string;

export class Document {
    readonly content: string;
    readonly lines: string[];
    readonly characters: Character[];

    constructor(readonly uri: string, content: string) {
        this.content = normalizeEndOfLines(content);
        this.lines = this.content.split('\n');
        this.characters = buildCharacters(this);
    }
}

function normalizeEndOfLines(content: string): string {
    return content.replace('\r\n', '\n').replace('\r', '\n');
}

function buildCharacters(document: Document): Character[] {
    const characters: Character[] = [];
    for (const [lineOffset, line] of document.lines.entries()) {
        const lineNumber = lineOffset + 1;
        for (const [characterOffset, character] of Array.from(line).entries()) {
            characters.push(new Character(character, new Position(lineNumber, characterOffset + 1)));
        }
        characters.push(new Character('\n', new Position(lineNumber, line.length + 1)));
    }
    return characters;
}

export interface Positioned {
    position: Position;
}

export class Character implements Positioned {
    constructor(
        readonly value: string,
        readonly position: Position,
    ) { }

    equals(that: Character) {
        return this.value === that.value;
    }

    static equal(a: Character, b: Character) {
        return a.equals(b);
    }
}

// See https://microsoft.github.io/language-server-protocol/specification

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
         */
        readonly character: number,
    ) { }
}

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
