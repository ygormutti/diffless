import {
    DiffLevel,
    Document,
    DocumentDiff,
    Edit,
    EditType,
    Equal,
    Excerpt,
    Location,
    Position,
    Range,
} from '../model';
import { LCS, LCSResult } from './lcs';

export interface ArrayDiffOptions<TItem extends Excerpt> {
    level: DiffLevel;
    equal: Equal<TItem>;
    itemMapper: ItemMapper<TItem>;
    lcsThreshold: number;
    lcs: LCS;
}

export type ItemMapper<TItem extends Excerpt> = (document: Document) => TItem[];

class ItemWrapper<TItem extends Excerpt> {
    constructor(
        readonly item: TItem,
        public paired: boolean = false,
    ) { }
}

export function arrayDiff<TItem extends Excerpt>(
    options: ArrayDiffOptions<TItem>,
    left: Document,
    right: Document,
): DocumentDiff {
    const { level, equal, itemMapper, lcsThreshold, lcs } = options;
    const leftWrapped = itemMapper(left).map(wrapItem);
    const rightWrapped = itemMapper(right).map(wrapItem);
    const equalWrapped = wrapEqual(equal);
    const lcsResults: LCSResult<ItemWrapper<TItem>>[] = [];

    let result = lcs(equalWrapped, leftWrapped, rightWrapped);
    while (result.lcs.length > lcsThreshold) {
        pairWrappers(leftWrapped, result.leftOffset, result.lcs.length);
        pairWrappers(rightWrapped, result.rightOffset, result.lcs.length);
        lcsResults.push(result);
        result = lcs(equalWrapped, leftWrapped, rightWrapped);
    }

    let edits: Edit[] = [];

    const deletions = findUnpairedRanges(leftWrapped).map(
        r => new Edit(level, EditType.Delete, new Location(left.uri, r), undefined),
    );
    edits = edits.concat(deletions);

    const additions = findUnpairedRanges(rightWrapped).map(
        r => new Edit(level, EditType.Add, undefined, new Location(right.uri, r)),
    );
    edits = edits.concat(additions);

    const moves = findMoves(lcsResults, leftWrapped, rightWrapped, left, right, level);
    edits = edits.concat(moves);

    return new DocumentDiff(left, right, edits, []);
}

function wrapItem<TItem extends Excerpt>(item: TItem): ItemWrapper<TItem> {
    return new ItemWrapper(item);
}

function wrapEqual<TItem extends Excerpt>(equal: Equal<TItem>): Equal<ItemWrapper<TItem>> {
    return (l: ItemWrapper<TItem>, r: ItemWrapper<TItem>): boolean => {
        return !r.paired && !l.paired && equal(l.item, r.item);
    };
}

function pairWrappers(array: ItemWrapper<Excerpt>[], offset: number, length: number) {
    for (let i = offset; i < (offset + length); i++) {
        const item = array[i];
        item.paired = true;
    }
}

function findUnpairedRanges(array: ItemWrapper<Excerpt>[]): Range[] {
    const ranges = [];

    let start: Position | undefined;
    let end: Position | undefined;
    for (const wrapper of array) {
        const { paired, item: { range } } = wrapper;
        end = range.start;
        if (start === undefined) {
            if (paired) {
                continue;
            } else {
                start = range.start;
            }
        } else {
            if (paired) {
                ranges.push(new Range(start, end));
                start = undefined;
            }
        }
    }

    if (start !== undefined && end !== undefined && !start.equals(end)) {
        ranges.push(new Range(start, end));
    }

    return ranges;
}

function findMoves(
    lcsResults: LCSResult<ItemWrapper<Excerpt>>[],
    leftWrapped: ItemWrapper<Excerpt>[],
    rightWrapped: ItemWrapper<Excerpt>[],
    left: Document,
    right: Document,
    level: DiffLevel,
): Edit[] {
    const edits: Edit[] = [];

    const rightSortedResults = lcsResults.slice().sort((a, b) => a.rightOffset - b.rightOffset);
    const leftSortedResults = lcsResults.slice().sort((a, b) => a.leftOffset - b.leftOffset);
    for (let l = 0, r = 0; l < lcsResults.length && r < lcsResults.length;) {
        const leftResult = leftSortedResults[l];
        const rightResult = rightSortedResults[r];

        if (leftResult === rightResult) {
            l++;
            r++;
        } else {
            const rightLongerThanLeft = rightResult.lcs.length >= leftResult.lcs.length;
            // heuristic to favor cheaper edit result, then moves in right side
            const result = rightLongerThanLeft ? leftResult : rightResult;
            const { lcs: { length }, leftOffset, rightOffset } = result;

            const leftRange = buildMoveRange(leftWrapped, leftOffset, length);
            const leftLocation = new Location(left.uri, leftRange);

            const rightRange = buildMoveRange(rightWrapped, rightOffset, length);
            const rightLocation = new Location(right.uri, rightRange);

            const edit = new Edit(level, EditType.Move, leftLocation, rightLocation);
            edits.push(edit);

            if (result === leftResult) {
                l++;
            } else {
                r++;
            }
        }
    }

    return edits;
}

function buildMoveRange(items: ItemWrapper<Excerpt>[], offset: number, length: number): Range {
    const start = items[offset].item.range.start;
    const end = items[offset + length - 1].item.range.end;
    return new Range(start, end);
}
