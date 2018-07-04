import { Equals, Excerpt, Location } from '../model';

export type Tokenizer = (document: Document) => Token[];

export class Token extends Excerpt {
    constructor(
        location: Location,
        content: string,
        readonly type: number,
    ) {
        super(content, location);
    }

    equals(other: Token): boolean {
        return !(other instanceof ValuedToken) && this.type === other.type;
    }

    static equals(a: Token, b: Token) {
        return a.equals(b);
    }
}

export class ValuedToken<TTokenValue> extends Token {
    constructor(
        location: Location,
        content: string,
        type: number,
        readonly value: TTokenValue,
        readonly valueEquals: Equals<TTokenValue>,
    ) {
        super(location, content, type);
    }

    equals(other: Token): boolean {
        return other instanceof ValuedToken
            && this.type === other.type
            && this.valueEquals(this.value, other.value);
    }
}
