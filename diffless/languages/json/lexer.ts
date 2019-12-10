import jsonTokenize = require('json-tokenize');
import { Token, ValuedToken } from '../../hcsdiff/model';
import { Document, DocumentURI, Location, Position, Range } from '../../model';

enum TokenType {
    LeftBrace = 'LeftBrace',
    RightBrace = 'RightBrace',
    Semicolon = 'Semicolon',
    Comma = 'Comma',
    LeftBracket = 'LeftBracket',
    RightBracket = 'RightBracket',
    String = 'String',
    Number = 'Number',
    Boolean = 'Boolean',
    Null = 'Null',
}

export function tokenize(document: Document): Token[] {
    return jsonTokenize(document.content)
        .map(token => adapt(document.uri, token))
        .filter(token => token !== undefined) as Token[];
}

export function adapt(uri: DocumentURI, token: JsonTokenize.Token): Token | undefined {
    const { type, value } = token;
    switch (type) {
        case 'literal':
            switch (value) {
                case null:
                    return toToken(uri, token, TokenType.Null);
                case true:
                case false:
                    return toValuedToken(uri, token, TokenType.Boolean);
            }
            break;

        case 'number':
            return toValuedToken(uri, token, TokenType.Number);

        case 'punctuation':
            switch (value) {
                case '{':
                    return toToken(uri, token, TokenType.LeftBrace);
                case '}':
                    return toToken(uri, token, TokenType.RightBrace);
                case '[':
                    return toToken(uri, token, TokenType.LeftBracket);
                case ']':
                    return toToken(uri, token, TokenType.RightBracket);
                case ':':
                    return toToken(uri, token, TokenType.Semicolon);
                case ',':
                    return toToken(uri, token, TokenType.Comma);
            }

        case 'string':
            return toValuedToken(uri, token, TokenType.String);

        case 'whitespace':
            return undefined;
    }
}

function toToken(uri: DocumentURI, token: JsonTokenize.Token, type: TokenType) {
    const { raw, position } = token;
    return new Token(toLocation(uri, raw, position), raw, type);
}

function toValuedToken(uri: DocumentURI, token: JsonTokenize.Token, type: TokenType) {
    const { raw, position } = token;
    return new ValuedToken(toLocation(uri, raw, position), raw, type, token.value, (a, b) => a === b);
}

function toLocation(uri: DocumentURI, raw: string, locator: JsonTokenize.Range | JsonTokenize.Position) {
    return new Location(uri, toRange(raw, locator));
}

function toRange(raw: string, locator: JsonTokenize.Range | JsonTokenize.Position) {
    let start;
    let end;
    if (raw.length === 1) {
        const position = locator as JsonTokenize.Position;
        start = new Position(position.lineno, position.column);
        end = new Position(position.lineno, position.column + 1);
    } else {
        const range = locator as JsonTokenize.Range;
        start = new Position(range.start.lineno, range.start.column);
        end = new Position(range.end.lineno, range.end.column + 1);
    }
    return new Range(start, end);
}
