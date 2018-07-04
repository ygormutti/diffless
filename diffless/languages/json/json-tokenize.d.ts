declare namespace JsonTokenize {
    enum TokenType {
        Whitespace = 'whitespace',
        String = 'string',
        Literal = 'literal',
        Number = 'number',
        Punctuation = 'punctuation',
    }

    interface Position {
        lineno: number;
        column: number;
    }

    interface Range {
        start: Position;
        end: Position;
    }

    interface Token {
        type: TokenType;
        position: Position | Range;
        raw: string;
        value: string | boolean | null | number;
    }
}

declare module 'json-tokenize' {
    const tokenize: (json: string) => JsonTokenize.Token[];
    export = tokenize;
}
