import { Equal, LCS, LCSResult } from './lcs';
import {
    Change,
    ChangeLevel,
    ChangeType,
    Document,
    DocumentUri,
    Location,
    Position,
    Positioned,
    Range,
} from './model';

export interface ItemMapper<T extends Positioned> {
    (document: Document): T[];
}

class ItemWrapper<T> {
    constructor(
        readonly item: T,
        public paired: boolean = false,
    ) { }
}

const LCS_THRESHOLD = 1;

export function arrayDiff<T extends Positioned>(
    lcs: LCS,
    level: ChangeLevel,
    equal: Equal<T>,
    itemMapper: ItemMapper<T>,
    left: Document,
    right: Document,
): Change[] {
    const leftWrapped = itemMapper(left).map(wrapItem);
    const rightWrapped = itemMapper(right).map(wrapItem);
    const equalWrapped = wrapEqual(equal);
    const lcsResults: LCSResult<ItemWrapper<T>>[] = [];

    let result = lcs(equalWrapped, leftWrapped, rightWrapped);
    while (result.lcs.length > LCS_THRESHOLD) {
        pair(leftWrapped, result.leftOffset, lcs.length);
        pair(rightWrapped, result.rightOffset, lcs.length);
        lcsResults.push(result);
        result = lcs(equalWrapped, leftWrapped, rightWrapped);
    }

    let changes: Change[] = [];

    const additions = findUnpairedRanges(rightWrapped).map(
        r => new Change(level, ChangeType.Add, undefined, new Location(right.uri, r)),
    );
    changes = changes.concat(additions);

    const deletions = findUnpairedRanges(leftWrapped).map(
        r => new Change(level, ChangeType.Delete, new Location(left.uri, r), undefined),
    );
    changes = changes.concat(deletions);

    // TODO detect moves
    // const rightSortedResults = lcsResults.slice().sort((a, b) => a.rightOffset - b.rightOffset);
    // const leftSortedResults = lcsResults.slice().sort((a, b) => a.leftOffset - b.leftOffset);
    // for (let l = 0, r = 0; l < lcsResults.length;) {
    //     const leftResult = leftSortedResults[l];
    //     const rightResult = rightSortedResults[r];

    //     if (leftResult === rightResult) {
    //         ++l;
    //         ++r;
    //     } else {
    //         const leftStart = new Position()
    //         const leftLocation = new Location(left.documentUri, new Range())
    //         ++l;
    //         changes.push(new Change(level, ChangeType.Move,))
    //     }
    // }

    return changes;
}

function wrapItem<T>(item: T): ItemWrapper<T> {
    return new ItemWrapper(item);
}

function wrapEqual<T>(equal: Equal<T>): Equal<ItemWrapper<T>> {
    return (l: ItemWrapper<T>, r: ItemWrapper<T>): boolean => {
        return !r.paired && !l.paired && equal(l.item, r.item);
    };
}

function pair<T>(array: ItemWrapper<T>[], offset: number, length: number): void {
    for (let i = offset; i < (offset + length); i++) {
        const item = array[i];
        item.paired = true;
    }
}

function findUnpairedRanges<T extends Positioned>(array: ItemWrapper<T>[]): Range[] {
    const ranges = [];

    let start: Position | undefined;
    let end: Position | undefined;
    for (const wrapper of array) {
        const { paired, item: { position } } = wrapper;
        end = position;
        if (start === undefined) {
            if (paired) {
                continue;
            } else {
                start = position;
            }
        } else {
            if (paired) {
                ranges.push(new Range(start, end));
                start = undefined;
            }
        }
    }

    if (start !== undefined && end !== undefined) {
        end = new Position(end.line, end.character + 1);
        ranges.push(new Range(start, end));
    }

    return ranges;
}
