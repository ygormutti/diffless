import { JSIN } from '../jsin';
import { DiffLevel, Document, Equals, Grain, Location, Weigh } from '../model';

export type Tokenizer = (document: Document) => Token[];

export interface ArrayDiffOptions<TGrain extends Grain> {
    level: DiffLevel;
    toGrainArray: GrainArrayMapper<TGrain>;
    similarityThreshold: number;
    equals?: Equals<TGrain>;
    weigh?: Weigh<TGrain>;
}

export type GrainArrayMapper<TGrain extends Grain> = (document: Document) => TGrain[];

@JSIN.enabled
export class Token extends Grain {
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
