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
) => TItem[];

class HCSCell<TItem> {
    constructor(
        readonly weight: number = 0,
        readonly hcs: TItem[] = [],
    ) { }
}

/**
 * Solves HCS by using dynamic programming and linear space optimization
 */
export function dynamicProgrammingHCS<TItem>(
    equals: Equals<TItem>,
    weigh: Weigh<TItem>,
    left: TItem[],
    right: TItem[],
): TItem[] {
    if (!left || !left.length || !right || !right.length) {
        return [];
    }

    const width = left.length + 1;
    const height = right.length + 1;

    let prevRowArray: HCSCell<TItem>[] = new Array(width);
    prevRowArray.fill(new HCSCell());

    for (let row = 1; row < height; row++) {
        const rowArray: HCSCell<TItem>[] = new Array(width);
        rowArray[0] = new HCSCell();

        for (let col = 1; col < width; col++) {
            const item = left[col - 1];
            if (equals(item, right[row - 1])) {
                const prevCell = prevRowArray[col - 1];
                rowArray[col] = new HCSCell(prevCell.weight + weigh(item), [...prevCell.hcs, item]);
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
    return prevRowArray[prevRowArray.length - 1].hcs;
}
