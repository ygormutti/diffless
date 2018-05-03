import { normalize } from "path";

export type DocumentUri = string;

export class Document {
    public readonly content: string;
    public readonly lines: string[];

    constructor(readonly uri: string, content: string) {
        this.content = normalizeEndOfLines(content);
        this.lines = this.content.split('\n');
    }
}

function normalizeEndOfLines(content: string): string {
    return content.replace('\r\n', '\n').replace('\r', '\n');
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

export interface Location {
    uri: DocumentUri;
    range: Range;
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
    Textual,
    Lexical,
    Semantic,
}

export interface Change {
    right?: Location;
    left?: Location;
    type: ChangeType;
    level: ChangeLevel;
}

export class Diff {
    constructor(
        readonly left: Document,
        readonly right: Document,
        readonly changes: Set<Change>,
    ) { }
}
