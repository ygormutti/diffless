import { bind } from 'decko';

interface Constructor {
    new(...args: any[]): {};
}

type Transformer = (key: any, value: any) => any | undefined;

export const DEFAULT_META_KEY = '__JSIN__';

export class BaseJSIN {
    readonly mapping: { [key: string]: Constructor };
    seed: number;

    constructor(
        readonly metaKey: string = DEFAULT_META_KEY,
    ) {
        this.mapping = {};
        this.seed = 0;
    }

    @bind
    enabled(constructor: Constructor) {
        const key = `${constructor.name}_${this.seed++}`;
        (constructor as any)[this.metaKey] = key;
        this.mapping[key] = constructor;
    }

    stringify(obj: any, replacer?: Transformer, space?: string | number): string {
        return JSON.stringify(obj, (key, value) => {
            if (replacer) value = replacer(key, value);
            const constructorKey = value && value.constructor[this.metaKey];
            if (!constructorKey) return value;
            return {
                ...value,
                [this.metaKey]: constructorKey,
            };
        }, space);
    }

    parse(text: string, reviver?: Transformer) {
        return JSON.parse(text, (key, value) => {
            if (value.hasOwnProperty(this.metaKey)) {
                const prototype = this.mapping[value[this.metaKey]].prototype;
                delete value[this.metaKey];
                Object.setPrototypeOf(value, prototype);
            }
            return reviver ? reviver(key, value) : value;
        });
    }
}

export const JSIN = new BaseJSIN();
