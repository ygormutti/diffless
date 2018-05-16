import { Change, ChangeLevel, ChangeType } from '../diffless/model';

export function test(val: any): val is Change[] {
    return val && val.length && val[0] instanceof Change;
}

export function print(changes: Change[], serialize: (obj: any) => string): string {
    changes.sort((a: Change, b: Change) => {
        let value = a.level - b.level;
        if (!value) {
            value = a.type - b.type;
        }
        return value;
    });
    const objects = changes.map(c => ({
        ...c,
        level: ChangeLevel[c.level],
        type: ChangeType[c.type],
    }));
    return serialize(objects);
}
