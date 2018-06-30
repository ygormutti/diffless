import { DiffLevel, Edit, EditType } from '../../diffless/model';
import { sortEdits } from '../../diffless/util';

export function test(val: any): val is Edit[] {
    return val && val.length && val[0] instanceof Edit;
}

export function print(edits: Edit[], serialize: (obj: any) => string): string {
    sortEdits(edits);
    const objects = edits.map(c => ({
        ...c,
        level: DiffLevel[c.level],
        type: EditType[c.type],
    }));
    return serialize(objects);
}
