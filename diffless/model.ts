export type DocumentUri = string;

export interface Document {
    uri: DocumentUri;
    content: string;
}

export class StringDocument implements Document {
    constructor(
        readonly uri: string,
        readonly content: string,
    ) { }
}

// See https://microsoft.github.io/language-server-protocol/specification

export interface Position {
    /**
     * Line position in a document (one-based).
     */
    line: number;

    /**
     * Character offset on a line in a document (one-based). Assuming that the line is
     * represented as a string, the `character` value represents the gap between the
     * `character` and `character + 1`.
     *
     * If the character value is greater than the line length it defaults back to the
     * line length.
     */
    character: number;
}

export interface Range {
    /**
     * The range's start position.
     */
    start: Position;

    /**
     * The range's end position.
     */
    end: Position;
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
    right?: Location,
    left?: Location,
    type: ChangeType;
    level: ChangeLevel;
}

export class Diff {
    constructor(
        readonly left: Document,
        readonly right: Document,
        readonly changes: Set<Change>
    ) { }
}