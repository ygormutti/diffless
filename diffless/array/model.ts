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
}

export class ValuedToken<TTokenValue> extends Token {
    constructor(
        location: Location,
        content: string,
        type: number,
        readonly value: TTokenValue,
        readonly equals: Equals<TTokenValue>,
    ) {
        super(location, content, type);
    }
}
