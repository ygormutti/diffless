export namespace model {
    interface Language { }

    // class DiffTool {
    //     constructor(
    //         readonly languages: Set<Language>
    //     ) { }

    //     diff(left: Diffable, right: Diffable): Diff {

    //     }
    // }

    interface Document {
        uri: string;
        content: string;
    }

    interface Directory {
        name: string;
        documents: Set<Document>;
        subdirectories: Set<Directory>;
    }

    interface Diffable {
        directory: Directory;
    }

    interface Comparer<T> {
        (a: T, b: T): number;
    }

    interface Comparable<T> {
        compare(other: T): number;
    }

    interface LCS<T extends Comparable<T>> {
        (a: Array<T>, b: Array<T>): LCSResult<T>;
    }

    interface SequenceDiff<T extends Comparable<T>> {
        (a: Array<T>, b: Array<T>): Set<Change>
    }

    class LCSResult<T> {
        constructor(
            readonly start: number,
            readonly end: number,
            readonly length: number,
            readonly lcs: Array<T>,
        ) { }
    }

    class Cursor {
        constructor(
            readonly document: Document,
            readonly line: number,
            readonly column: number,
        ) { }
    }

    class Token {
        constructor(
            readonly type: number,
            readonly raw: string,
            readonly start: Cursor,
            readonly length: number,
        ) { }
    }

    interface Argument {
        id: string;
        isDirectory: boolean;
    }

    class StringDocument implements Document {
        constructor(
            readonly content: string,
            readonly uri: string,
        ) { }
    }

    // class String implements Diffable {
    //     constructor(
    //         readonly s: string
    //     ) { }

    //     get directory() {
    //         return new Set([new StringDocument(this.s)]);
    //     }
    // }

    class Diff {
        constructor(
            readonly input: Array<Diffable>,
            readonly changes: Array<Change>,
        ) { }
    }

    class DirectoryDiff {
        constructor(
            readonly left: Directory,
            readonly right: Directory,
            readonly files: Set<DocumentDiff>
        ) { }
    }
    
    // See https://microsoft.github.io/language-server-protocol/specification

    interface Position {
        /**
         * Line position in a document (zero-based).
         */
        line: number;
    
        /**
         * Character offset on a line in a document (zero-based). Assuming that the line is
         * represented as a string, the `character` value represents the gap between the
         * `character` and `character + 1`.
         *
         * If the character value is greater than the line length it defaults back to the
         * line length.
         */
        character: number;
    }
    
    interface Range {
        /**
         * The range's start position.
         */
        start: Position;
    
        /**
         * The range's end position.
         */
        end: Position;
    }
    
    type DocumentUri = string;
    
    interface Location {
        uri: DocumentUri;
        range: Range;
    }
    
    enum ChangeType {
        Add,
        Delete,
        Move,
        Copy,
        Rename,
    }
    
    enum ChangeLevel {
        Textual,
        Lexical,
        Semantic,
    }
    
    interface Change {
        range: Range;
        type: ChangeType;
        level: ChangeLevel;
        relatedLocations: Array<Location>;
    }
    
    class DocumentDiff {
        constructor(
            readonly left: Document,
            readonly right: Document,
            readonly changes: Set<Change>
        ) { }
    }
}