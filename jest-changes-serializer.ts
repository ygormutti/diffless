import { Change, ChangeLevel, ChangeType } from './diffless/model';

export function test(val: any): val is Change[] {
    return val && val.length && val[0] instanceof Change;
}

export function print(changes: Change[], serialize: (obj: any) => string): string {
    const objects = changes.map(c => ({
        ...c,
        level: ChangeLevel[c.level],
        type: ChangeType[c.type],
    }));
    return serialize(objects);
}
