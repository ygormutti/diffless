import { JSIN } from './jsin';

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
 * Function type that checks if two objects are equal according to some criteria
 */
export type Equals<T> = (a: T, b: T) => boolean;

/**
 * Function type that returns the object weigh
 */
export type Weigh<T> = (obj: T) => number;

/**
 * The end of line sequence adopted for internal use
 */
export const EOL = '\n';

/**
 * Position in a text document expressed as one-based line and one-based character offset.
 *
 * A position is between two characters like an ‘insert’ cursor in a editor.
 */
@JSIN.enabled
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

    get lineOffset() {
        return this.line - 1;
    }

    get characterOffset() {
        return this.character - 1;
    }

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
@JSIN.enabled
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

    static forLine(line: number) {
        return new Range(new Position(line, 1), new Position(line + 1, 1));
    }

    static forCharacter(position: Position, content: string) {
        const end = content === EOL ?
            new Position(position.line + 1, 1) :
            new Position(position.line, position.character + 1);
        return new Range(position, end);
    }
}

@JSIN.enabled
export class Location {
    constructor(
        readonly uri: DocumentUri,
        readonly range: Range,
    ) { }

    toString() {
        return `${this.range.toString()} @ ${this.uri}`;
    }

    static forLine(documentUri: DocumentUri, line: number) {
        return new Location(documentUri, Range.forLine(line));
    }

    static forCharacter(documentUri: DocumentUri, position: Position, content: string) {
        return new Location(documentUri, Range.forCharacter(position, content));
    }
}

/**
 * An object which represents an excerpt from a text document
 */
@JSIN.enabled
export class Excerpt {
    constructor(
        readonly content: string,
        readonly location: Location,
    ) { }

    get range() {
        return this.location.range;
    }

    static sameContent(a: Excerpt, b: Excerpt) {
        return a.content === b.content;
    }
}

/**
 * A line excerpt from a text document
 */
@JSIN.enabled
export class Line extends Excerpt {
    constructor(
        content: string,
        documentUri: DocumentUri,
        readonly line: number,
    ) {
        super(content, Location.forLine(documentUri, line));
    }
}

/**
 * A single character excerpt from a text document
 */
@JSIN.enabled
export class Character extends Excerpt {
    constructor(
        content: string,
        documentUri: DocumentUri,
        readonly position: Position,
    ) {
        super(content, Location.forCharacter(documentUri, position, content));
    }
}

/**
 * A text document
 */
@JSIN.enabled
export class Document {
    readonly lines: Line[];
    readonly characters: Character[];

    constructor(
        readonly uri: DocumentUri,
        readonly content: string,
    ) {
        const linesContents = normalizeEOLs(content).split(EOL);
        this.lines = buildLines(linesContents, uri);
        this.characters = buildCharacters(this.lines, uri);
    }

    getPosition(position: Position): string {
        const line = this.lines[position.lineOffset].content;
        return position.character > line.length ? EOL : line[position.characterOffset];
    }

    getRange(range: Range): string {
        const { start, end } = range;
        const lines = this.lines.filter((_, i) => start.lineOffset <= i && i <= end.lineOffset);

        if (lines.length === 1) {
            return lines[0].content.substring(start.characterOffset, end.characterOffset);
        }

        let rangeString = '';
        for (let lineOffset = 0; lineOffset < lines.length; lineOffset++) {
            const line = lines[lineOffset].content;
            let startOffset = 0;
            let endOffset = line.length;
            if (lineOffset === 0) {
                // first line
                startOffset = start.characterOffset;
            } else if (lineOffset === lines.length - 1) {
                // last line
                endOffset = end.characterOffset;
            }

            rangeString += line.substring(startOffset, Math.min(line.length, endOffset));
        }
        return rangeString;
    }
}

function buildLines(linesContents: string[], documentUri: DocumentUri): Line[] {
    return linesContents.map((v, i) => new Line(v + EOL, documentUri, i + 1));
}

function buildCharacters(lines: Line[], documentUri: DocumentUri): Character[] {
    const characters: Character[] = [];
    for (const [lineOffset, line] of lines.entries()) {
        const lineNumber = lineOffset + 1;
        for (const [characterOffset, character] of Array.from(line.content).entries()) {
            const position = new Position(lineNumber, characterOffset + 1);
            characters.push(new Character(character, documentUri, position));
        }
    }
    return characters;
}

function normalizeEOLs(content: string): string {
    return content.replace('\r\n', EOL).replace('\r', EOL);
}

export enum EditType {
    Add,
    Delete,
    Change,
    Move,
    Copy,
    Rename,
}

export enum DiffLevel {
    Binary,
    Textual,
    Lexical,
    Syntactic,
    Semantic,
}

@JSIN.enabled
export class DiffItem {
    constructor(
        readonly level: DiffLevel,
        readonly left?: Location,
        readonly right?: Location,
    ) { }
}

@JSIN.enabled
export class Edit extends DiffItem {
    constructor(
        level: DiffLevel,
        readonly type: EditType,
        left?: Location,
        right?: Location,
    ) {
        super(level, left, right);
    }

    toString() {
        return `${DiffLevel[this.level]} ${EditType[this.type].toLowerCase()}. ` +
            `Left: ${this.left ? this.left.toString() : ''}. ` +
            `Right: ${this.right ? this.right.toString() : ''}`;
    }
}

@JSIN.enabled
export class Similarity extends DiffItem { }

@JSIN.enabled
export class DocumentDiff {
    constructor(
        readonly left: Document,
        readonly right: Document,
        readonly edits: Edit[],
        readonly similarities: Similarity[],
    ) { }
}
