import { JSIN } from '../jsin';
import { Atom, DiffLevel, Document, Equals, Location, Weigh } from '../model';

export type Tokenizer = (document: Document) => Token[];

export interface ArrayDiffOptions<TAtom extends Atom> {
    level: DiffLevel;
    toAtomArray: AtomArrayMapper<TAtom>;
    similarityThreshold: number;
    equals?: Equals<TAtom>;
    weigh?: Weigh<TAtom>;
}

export type AtomArrayMapper<TAtom extends Atom> = (document: Document) => TAtom[];

@JSIN.enabled
export class Token extends Atom {
    constructor(
        location: Location,
        content: string,
        readonly type: string,
    ) {
        super(content, location);
    }

    equals(other: Token): boolean {
        return !(other instanceof ValuedToken) && this.type === other.type;
    }

    get code() {
        return `<${this.type}, ${JSON.stringify(this.content)}> @ ${this.location.code}`;
    }

    static equals(a: Token, b: Token) {
        return a.equals(b);
    }
}

@JSIN.enabled
export class ValuedToken<TTokenValue> extends Token {
    constructor(
        location: Location,
        content: string,
        type: string,
        readonly value: TTokenValue,
        readonly valueEquals: Equals<TTokenValue>,
    ) {
        super(location, content, type);
    }

    get code() {
        return `<${this.type}, ${JSON.stringify(this.content)}, ${this.value}> @ ${this.location.code}`;
    }

    equals(other: Token): boolean {
        return other instanceof ValuedToken
            && this.type === other.type
            && this.valueEquals(this.value, other.value);
    }
}
