import { JSIN } from './jsin';

/**
 * Model classes and interfaces.
 *
 * Design and docs inspired by: https://microsoft.github.io/language-server-protocol/specification
 */

/**
 * The URI of a document
 */
export type DocumentURI = string;

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
 * A type which instances have a natural total order
 */
export interface Comparable<T> {
    compareTo(other: T): number;
}

/**
 * Position in a text document expressed as one-based line and one-based character offset.
 *
 * A position is between two characters like an ‘insert’ cursor in a editor.
 */
@JSIN.enabled
export class Position implements Comparable<Position> {
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

    get code() {
        return `${this.line}:${this.character}`;
    }

    equals(other: Position) {
        return this.compareTo(other) === 0;
    }

    compareTo(other: Position): number {
        let value = this.line - other.line;
        if (!value) { value = this.character - other.character; }
        return value;
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
export class Range implements Comparable<Range> {
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

    get code() {
        return `[${(this.start.code)}; ${this.end.code})`;
    }

    compareTo(other: Range): number {
        let value = this.start.compareTo(other.start);
        if (!value) { value = this.end.compareTo(other.end); }
        return value;
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
        readonly uri: DocumentURI,
        readonly range: Range,
    ) { }

    get code() {
        return `${this.range.code} @ ${this.uri}`;
    }

    static forLine(documentURI: DocumentURI, line: number) {
        return new Location(documentURI, Range.forLine(line));
    }

    static forCharacter(documentURI: DocumentURI, position: Position, content: string) {
        return new Location(documentURI, Range.forCharacter(position, content));
    }
}

/**
 * The unit of comparison of an atomic diff tool
 */
@JSIN.enabled
export class Atom {
    constructor(
        readonly content: string,
        readonly location: Location,
    ) { }

    get start() {
        return this.location.range.start;
    }

    get end() {
        return this.location.range.end;
    }

    static contentLength(atom: Atom) {
        return atom.content.length;
    }

    static sameContent(a: Atom, b: Atom) {
        return a.content === b.content;
    }
}

/**
 * A line from a text document
 */
@JSIN.enabled
export class Line extends Atom {
    constructor(
        content: string,
        documentURI: DocumentURI,
        readonly line: number,
    ) {
        super(content, Location.forLine(documentURI, line));
    }
}

/**
 * A single character from a text document
 */
@JSIN.enabled
export class Character extends Atom {
    constructor(
        content: string,
        documentURI: DocumentURI,
        readonly position: Position,
    ) {
        super(content, Location.forCharacter(documentURI, position, content));
    }
}

/**
 * The default content type for text documents
 */
export const DEFAULT_CONTENT_TYPE = 'text/plain';

/**
 * A text document
 */
@JSIN.enabled
export class Document {
    readonly lines: Line[];
    readonly characters: Character[];

    constructor(
        readonly uri: DocumentURI,
        readonly content: string,
        readonly contentType: string = DEFAULT_CONTENT_TYPE,
    ) {
        const linesContents = normalizeEOLs(content).split(EOL);
        this.lines = buildLines(linesContents, uri);
        this.characters = buildCharacters(this.lines, uri);
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

function buildLines(linesContents: string[], documentURI: DocumentURI): Line[] {
    return linesContents.map((v, i) => new Line(v + EOL, documentURI, i + 1));
}

function buildCharacters(lines: Line[], documentURI: DocumentURI): Character[] {
    const characters: Character[] = [];
    for (const [lineOffset, line] of lines.entries()) {
        const lineNumber = lineOffset + 1;
        for (const [characterOffset, character] of Array.from(line.content).entries()) {
            const position = new Position(lineNumber, characterOffset + 1);
            characters.push(new Character(character, documentURI, position));
        }
    }
    return characters;
}

function normalizeEOLs(content: string): string {
    return content.replace('\r\n', EOL).replace('\r', EOL);
}

export enum EditOperation {
    Add,
    Delete,
    Replace,
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
    DataFlow,
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
export class Edit extends DiffItem implements Comparable<Edit> {
    constructor(
        level: DiffLevel,
        readonly operation: EditOperation,
        left?: Location,
        right?: Location,
    ) {
        super(level, left, right);
    }

    get code() {
        return `${DiffLevel[this.level]} ${EditOperation[this.operation].toLowerCase()}, ` +
            (this.left ? `L: ${this.left!.code}` : '') +
            (this.left && this.right ? ', ' : '') +
            (this.right ? `R: ${this.right!.code}` : '');
    }

    compareTo(other: Edit): number {
        let value = other.level - this.level;
        if (!value) { value = other.operation - this.operation; }
        if (!value && this.right && other.right) { value = this.right.range.compareTo(other.right.range); }
        if (!value && this.left && other.left) { value = this.left.range.compareTo(other.left.range); }
        return value;
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

export type DiffTool = (left: Document, right: Document) => DocumentDiff;

export type DiffToolFactory = (options: any) => DiffTool;
