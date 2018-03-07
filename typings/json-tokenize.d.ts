export as namespace tokenizer;

export = tokenize;

declare function tokenize(json: string, tokens?: tokenize.Token[], position?: tokenize.Position): tokenize.Token[];

declare namespace tokenize {

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

    interface Token {
        type: TokenType;
        position: Position;
        raw: string;
        value: string | boolean | null | number;
    }

}