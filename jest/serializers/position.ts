import { Position } from '../../diffless/model';

export function test(val: any): val is Position {
    return val && val instanceof Position;
}

export function print(position: Position): string {
    return position.code;
}
