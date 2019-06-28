import { DiffLevel, Edit, EditOperation } from '../../diffless/model';
import { sortEdits } from '../../diffless/util';

export function test(val: any): val is Edit[] {
    return val && val.length && val[0] instanceof Edit;
}

export function print(edits: Edit[], serialize: (obj: any) => string): string {
    sortEdits(edits);
    const objects = edits.map(e => ({
        ...e,
        level: DiffLevel[e.level],
        operation: EditOperation[e.operation],
    }));
    return serialize(objects);
}
