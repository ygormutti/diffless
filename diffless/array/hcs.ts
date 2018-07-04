import { Equals, Weigh } from '../model';

/**
 * Heaviest Common Subsequence model and implementation
 */

/**
 * Function type that finds the HCS between two arrays
 */
export type HCS = <TItem>(
    equal: Equals<TItem>,
    weigh: Weigh<TItem>,
    left: TItem[],
    right: TItem[],
) => HCSResult<TItem>;

/**
 * The Heaviest Common Subsequence of two arrays with items from the respective arrays
 */
export class HCSResult<TItem> {
    constructor(
        readonly weight: number,
        readonly leftHCS: TItem[],
        readonly rightHCS: TItem[],
    ) { }

    get length() {
        return this.leftHCS.length;
    }
}

class HCSCell<TItem> {
    constructor(
        readonly weight: number = 0,
        readonly hcs: [TItem, TItem][] = [],
    ) { }
}

/**
 * Solves HCS with quadratic time and linear space complexity
 */
export function dynamicProgrammingHCS<TItem>(
    equals: Equals<TItem>,
    weigh: Weigh<TItem>,
    left: TItem[],
    right: TItem[],
): HCSResult<TItem> {
    if (!left || !left.length || !right || !right.length) {
        return new HCSResult(0, [], []);
    }

    const width = left.length + 1;
    const height = right.length + 1;

    let prevRowArray: HCSCell<TItem>[] = new Array(width);
    prevRowArray.fill(new HCSCell());

    for (let row = 1; row < height; row++) {
        const rowArray: HCSCell<TItem>[] = new Array(width);
        rowArray[0] = new HCSCell();

        for (let col = 1; col < width; col++) {
            const leftItem = left[col - 1];
            const rightItem = right[row - 1];
            if (equals(leftItem, rightItem)) {
                const prevCell = prevRowArray[col - 1];
                const newWeight = prevCell.weight + weigh(leftItem);
                rowArray[col] = new HCSCell(newWeight, [...prevCell.hcs, [leftItem, rightItem]]);
            } else {
                const previousCellCandidates = [rowArray[col - 1], prevRowArray[col]];
                previousCellCandidates.sort((a, b) => {
                    if (a.weight !== b.weight) {
                        return b.weight - a.weight;
                    }
                    return a.hcs.length - b.hcs.length;
                });
                rowArray[col] = previousCellCandidates[0];
            }
        }
        prevRowArray = rowArray;
    }

    const lastCell = prevRowArray[prevRowArray.length - 1];
    const { hcs, weight } = lastCell;
    const leftHCS = hcs.map(p => p[0]);
    const rightHCS = hcs.map(p => p[1]);
    return new HCSResult(weight, leftHCS, rightHCS);
}
