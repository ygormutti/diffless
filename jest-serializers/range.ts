import { Range } from '../diffless/model';

export function test(val: any): val is Range {
    return val && val instanceof Range;
}

export function print(range: Range, serialize: (obj: any) => string): string {
    return range.toString();
}
