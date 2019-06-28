import { bind } from 'decko';
import {
    Atom,
    Document,
    DocumentDiff,
    Edit,
    EditOperation,
    Equals,
    Location,
    Range,
    Similarity,
    Weigh,
} from '../model';
import { dynamicProgrammingHCS, HCS, HCSResult } from './hcs';
import { ArrayDiffOptions } from './model';

class Wrapper<TAtom extends Atom> {
    constructor(
        readonly atom: TAtom,
        readonly index: number,
        readonly weight: number,
        public paired: boolean = false,
    ) { }
}

export class ArrayDiffTool<TAtom extends Atom> {
    private equals: Equals<Wrapper<TAtom>>;
    private weigh: Weigh<TAtom>;
    private hcs: HCS;

    constructor(
        readonly options: ArrayDiffOptions<TAtom>,
        hcs?: HCS,
    ) {
        this.equals = this.wrapEquals(options.equals || Atom.sameContent);
        this.weigh = options.weigh || Atom.contentLength;
        this.hcs = hcs || dynamicProgrammingHCS;
    }

    @bind
    private wrapAtom(atom: TAtom, index: number): Wrapper<TAtom> {
        return new Wrapper(atom, index, this.weigh(atom));
    }

    private wrapEquals(equals: Equals<TAtom>) {
        return (a: Wrapper<TAtom>, b: Wrapper<TAtom>) => equals(a.atom, b.atom);
    }

    compare(left: Document, right: Document): DocumentDiff;
    compare(left: string, right: string): DocumentDiff;
    @bind
    compare(left: Document | string, right: Document | string): DocumentDiff {
        if (typeof left === 'string') { left = new Document('string:left', left); }
        if (typeof right === 'string') { right = new Document('string:right', right); }

        const { toAtomArray, level } = this.options;
        const leftWrappers = toAtomArray(left).map(this.wrapAtom);
        const rightWrappers = toAtomArray(right).map(this.wrapAtom);

        const hcsResult = this.hcs(this.equals, getWeight, leftWrappers, rightWrappers);
        const similarities = this.processHCSResult(
            hcsResult,
            (l, r) => new Similarity(level, l, r),
        );

        let edits: Edit[] = [];

        const moves = this.findMoves(leftWrappers, rightWrappers);
        edits = edits.concat(moves);

        const deletions = this.processUnpairedAtoms(
            leftWrappers,
            l => new Edit(level, EditOperation.Delete, l),
        );
        edits = edits.concat(deletions);

        const additions = this.processUnpairedAtoms(
            rightWrappers,
            l => new Edit(level, EditOperation.Add, undefined, l),
        );
        edits = edits.concat(additions);

        return new DocumentDiff(left, right, edits, similarities);
    }

    private processHCSResult<TDiffItem>(
        hcsResult: HCSResult<Wrapper<TAtom>>,
        buildDiffItem: (left: Location, right: Location) => TDiffItem,
    ): TDiffItem[] {
        if (hcsResult.length === 0) return [];

        const { similarityThreshold } = this.options;
        const diffItems: TDiffItem[] = [];
        const { leftHCS, rightHCS } = hcsResult;
        const leftURI = leftHCS[0].atom.location.uri;
        const rightURI = rightHCS[0].atom.location.uri;

        let leftStart = leftHCS[0].atom.start;
        let leftEnd = leftStart;
        let rightStart = rightHCS[0].atom.start;
        let rightEnd = rightStart;
        let similarityWeight = 0;
        let toPair: Wrapper<TAtom>[] = [];

        function checkForDiffItem() {
            if (similarityWeight > similarityThreshold) {
                const leftLocation = new Location(leftURI, new Range(leftStart, leftEnd));
                const rightLocation = new Location(rightURI, new Range(rightStart, rightEnd));
                toPair.forEach(wrapper => {
                    wrapper.paired = true;
                });
                diffItems.push(buildDiffItem(leftLocation, rightLocation));
            }
        }

        for (let i = 0; i < hcsResult.length; i++) {
            const leftWrapper = leftHCS[i];
            const { atom: left } = leftWrapper;
            const rightWrapper = rightHCS[i];
            const { atom: right } = rightWrapper;

            if (left.start.equals(leftEnd) && right.start.equals(rightEnd)) {
                leftEnd = left.end;
                rightEnd = right.end;
                similarityWeight += leftWrapper.weight;
                toPair.push(rightWrapper);
                toPair.push(leftWrapper);
            } else {
                checkForDiffItem();
                similarityWeight = leftWrapper.weight;
                toPair = [leftWrapper, rightWrapper];
                leftStart = left.start;
                leftEnd = left.end;
                rightStart = right.start;
                rightEnd = right.end;
            }
        }
        checkForDiffItem();

        return diffItems;
    }

    private findMoves(leftWrappers: Wrapper<TAtom>[], rightWrappers: Wrapper<TAtom>[]) {
        const { level } = this.options;
        const lcsUnpaired = () => {
            leftWrappers = leftWrappers.filter(unpaired);
            rightWrappers = rightWrappers.filter(unpaired);
            return this.hcs(this.equals, one, leftWrappers, rightWrappers);
        };

        let moves: Edit[] = [];

        let lcsResult = lcsUnpaired();
        let previousWeight = Infinity;
        while (lcsResult.weight < previousWeight) {
            moves = moves.concat(this.processHCSResult(
                lcsResult,
                (l, r) => new Edit(level, EditOperation.Move, l, r),
            ));
            lcsResult = lcsUnpaired();
            previousWeight = lcsResult.weight;
        }

        return moves;
    }

    private processUnpairedAtoms<TDiffItem>(
        wrappers: Wrapper<TAtom>[],
        buildDiffItem: (location: Location) => TDiffItem,
    ) {
        wrappers = wrappers.filter(unpaired);
        if (wrappers.length === 0) return [];

        const edits: TDiffItem[] = [];
        const firstAtom = wrappers[0].atom;
        const uri = firstAtom.location.uri;
        let start = firstAtom.start;
        let end = start;

        const pushDiffItem = () => {
            const location = new Location(uri, new Range(start, end));
            edits.push(buildDiffItem(location));
        };

        for (const wrapper of wrappers) {
            const { atom } = wrapper;

            if (atom.start.equals(end)) {
                end = atom.end;
            } else {
                pushDiffItem();
                start = atom.start;
                end = atom.end;
            }
        }
        pushDiffItem();

        return edits;
    }
}

function getWeight<TAtom extends Atom>(wrappedAtom: Wrapper<TAtom>): number {
    return wrappedAtom.weight;
}

function unpaired<TAtom extends Atom>(wrapper: Wrapper<TAtom>) {
    return !wrapper.paired;
}

function one() {
    return 1;
}
