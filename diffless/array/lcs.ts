import { Equals } from '../model';

/**
 * Longest Common Substring model and implementation
 */

/**
 * Function type that finds the LCS between two arrays
 */
export type LCS = <TItem>(equal: Equals<TItem>, left: TItem[], right: TItem[]) => LCSResult<TItem>;

/**
 * The Longest Common Substring of two arrays an its offset in both arrays
 */
export class LCSResult<TItem> {
    constructor(
        readonly lcs: TItem[],
        readonly leftOffset: number,
        readonly rightOffset: number,
    ) { }
}

/**
 * Solves LCS by using dynamic programming in O(left.length * right.length) time and space
 *
 * Based on:
 * https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Longest_common_substring#JavaScript
 *
 * @param left left array
 * @param right right array
 */
export function dynamicProgrammingLCS<TItem>(
    equal: Equals<TItem>,
    left: TItem[],
    right: TItem[],
): LCSResult<TItem> {
    if (!left || !left.length || !right || !right.length) {
        return new LCSResult([], 0, 0);
    }

    const table = getInitialTable(left.length, right.length);

    let lcs: TItem[] = [];
    let lcsLength = 0;
    let lcsLeftOffset = 0;
    let csLeftOffset = 0;
    let csRightOffset = 0;

    for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
            if (!equal(left[i], right[j])) {
                table[i][j] = 0;
            } else {
                if ((i === 0) || (j === 0)) {
                    table[i][j] = 1;
                } else {
                    table[i][j] = 1 + table[i - 1][j - 1];
                }

                const csLength = table[i][j];
                if (csLength > lcsLength) {
                    lcsLength = csLength;
                    csLeftOffset = i - csLength + 1;
                    csRightOffset = j - csLength + 1;

                    if (lcsLeftOffset === csLeftOffset) {
                        // same LCS
                        lcs.push(left[i]);
                    } else {
                        // new LCS
                        lcsLeftOffset = csLeftOffset;
                        lcs = left.slice(lcsLeftOffset, lcsLeftOffset + lcsLength);
                    }
                }
            }
        }
    }

    return new LCSResult(lcs, csLeftOffset, csRightOffset);
}

function getInitialTable(rows: number, columns: number): number[][] {
    const table = new Array(rows);
    for (let i = 0; i < rows; i++) {
        const row = new Array(columns);
        row.fill(0);
        table[i] = row;
    }
    return table;
}
