import { bind } from 'decko';
import {
    Document,
    DocumentDiff,
    Edit,
    EditType,
    Equals,
    Grain,
    Location,
    Range,
    Similarity,
    Weigh,
} from '../model';
import { dynamicProgrammingHCS, HCS, HCSResult } from './hcs';
import { ArrayDiffOptions } from './model';

class Wrapper<TGrain extends Grain> {
    constructor(
        readonly grain: TGrain,
        public paired: boolean = false,
    ) { }
}

export class ArrayDiffTool<TGrain extends Grain> {
    private equals: Equals<Wrapper<TGrain>>;
    private weigh: Weigh<Wrapper<TGrain>>;
    private hcs: HCS;

    constructor(
        readonly options: ArrayDiffOptions<TGrain>,
        hcs?: HCS,
    ) {
        this.equals = this.wrapEquals(options.equals || Grain.sameContent);
        this.weigh = this.wrapWeigh(options.weigh || Grain.contentLength);
        this.hcs = hcs || dynamicProgrammingHCS;
    }

    private wrapGrain(grain: TGrain): Wrapper<TGrain> {
        return new Wrapper(grain);
    }

    private wrapEquals(equals: Equals<TGrain>) {
        return (a: Wrapper<TGrain>, b: Wrapper<TGrain>) => equals(a.grain, b.grain);
    }

    private wrapWeigh(weigh: Weigh<TGrain>) {
        return (obj: Wrapper<TGrain>) => weigh(obj.grain);
    }

    run(left: Document, right: Document): DocumentDiff;
    run(left: string, right: string): DocumentDiff;
    @bind
    run(left: Document | string, right: Document | string): DocumentDiff {
        if (typeof left === 'string') { left = new Document('string:left', left); }
        if (typeof right === 'string') { right = new Document('string:right', right); }

        const { toGrainArray, level } = this.options;
        const leftWrappers = toGrainArray(left).map(this.wrapGrain);
        const rightWrappers = toGrainArray(right).map(this.wrapGrain);

        const hcsResult = this.hcs(this.equals, this.weigh, leftWrappers, rightWrappers);
        const similarities = this.processHCSResult(
            hcsResult,
            (l, r) => new Similarity(level, l, r),
        );

        let edits: Edit[] = [];

        const moves = this.findMoves(leftWrappers, rightWrappers);
        edits = edits.concat(moves);

        const deletions = this.processUnpairedGrains(
            leftWrappers,
            l => new Edit(level, EditType.Delete, l),
        );
        edits = edits.concat(deletions);

        const additions = this.processUnpairedGrains(
            rightWrappers,
            l => new Edit(level, EditType.Add, undefined, l),
        );
        edits = edits.concat(additions);

        return new DocumentDiff(left, right, edits, similarities);
    }

    private processHCSResult<TDiffItem>(
        hcsResult: HCSResult<Wrapper<TGrain>>,
        buildDiffItem: (left: Location, right: Location) => TDiffItem,
    ): TDiffItem[] {
        if (hcsResult.length === 0) return [];

        const { similarityThreshold } = this.options;
        const diffItems: TDiffItem[] = [];
        const { leftHCS, rightHCS } = hcsResult;
        const leftURI = leftHCS[0].grain.location.uri;
        const rightURI = rightHCS[0].grain.location.uri;

        let leftStart = leftHCS[0].grain.start;
        let leftEnd = leftStart;
        let rightStart = rightHCS[0].grain.start;
        let rightEnd = rightStart;
        let similarityWeight = 0;
        let toPair: Wrapper<TGrain>[] = [];

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
            const { grain: left } = leftWrapper;
            const rightWrapper = rightHCS[i];
            const { grain: right } = rightWrapper;

            if (left.start.equals(leftEnd) && right.start.equals(rightEnd)) {
                leftEnd = left.end;
                rightEnd = right.end;
                similarityWeight += this.weigh(leftWrapper);
                toPair.push(rightWrapper);
                toPair.push(leftWrapper);
            } else {
                checkForDiffItem();
                similarityWeight = this.weigh(leftWrapper);
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

    private findMoves(leftWrappers: Wrapper<TGrain>[], rightWrappers: Wrapper<TGrain>[]) {
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
                (l, r) => new Edit(level, EditType.Move, l, r),
            ));
            lcsResult = lcsUnpaired();
            previousWeight = lcsResult.weight;
        }

        return moves;
    }

    private processUnpairedGrains<TDiffItem>(
        wrappers: Wrapper<TGrain>[],
        buildDiffItem: (location: Location) => TDiffItem,
    ) {
        wrappers = wrappers.filter(unpaired);
        if (wrappers.length === 0) return [];

        const edits: TDiffItem[] = [];
        const firstGrain = wrappers[0].grain;
        const uri = firstGrain.location.uri;
        let start = firstGrain.start;
        let end = start;

        const pushDiffItem = () => {
            const location = new Location(uri, new Range(start, end));
            edits.push(buildDiffItem(location));
        };

        for (const wrapper of wrappers) {
            const { grain } = wrapper;

            if (grain.start.equals(end)) {
                end = grain.end;
            } else {
                pushDiffItem();
                start = grain.start;
                end = grain.end;
            }
        }
        pushDiffItem();

        return edits;
    }
}

function unpaired<TGrain extends Grain>(wrapper: Wrapper<TGrain>) {
    return !wrapper.paired;
}

function one() {
    return 1;
}
