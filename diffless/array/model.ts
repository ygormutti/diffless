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

@JSIN.enabled
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
