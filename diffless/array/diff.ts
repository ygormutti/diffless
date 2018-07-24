import { bind } from 'decko';
import {
    Document,
    DocumentDiff,
    Edit,
    EditType,
    Equals,
    Excerpt,
    Location,
    Range,
    Similarity,
    Weigh,
} from '../model';
import { dynamicProgrammingHCS, HCS, HCSResult } from './hcs';
import { ArrayDiffOptions } from './model';

class Wrapper<TExcerpt extends Excerpt> {
    constructor(
        readonly excerpt: TExcerpt,
        public paired: boolean = false,
    ) { }
}

export class ArrayDiffTool<TExcerpt extends Excerpt> {
    private equals: Equals<Wrapper<TExcerpt>>;
    private weigh: Weigh<Wrapper<TExcerpt>>;
    private hcs: HCS;

    constructor(
        readonly options: ArrayDiffOptions<TExcerpt>,
        hcs?: HCS,
    ) {
        this.equals = this.wrapEquals(options.equals || Excerpt.sameContent);
        this.weigh = this.wrapWeigh(options.weigh || Excerpt.contentLength);
        this.hcs = hcs || dynamicProgrammingHCS;
    }

    private wrapExcerpt(excerpt: TExcerpt): Wrapper<TExcerpt> {
        return new Wrapper(excerpt);
    }

    private wrapEquals(equals: Equals<TExcerpt>) {
        return (a: Wrapper<TExcerpt>, b: Wrapper<TExcerpt>) => equals(a.excerpt, b.excerpt);
    }

    private wrapWeigh(weigh: Weigh<TExcerpt>) {
        return (obj: Wrapper<TExcerpt>) => weigh(obj.excerpt);
    }

    run(left: Document, right: Document): DocumentDiff;
    run(left: string, right: string): DocumentDiff;
    @bind
    run(left: Document | string, right: Document | string): DocumentDiff {
        if (typeof left === 'string') { left = new Document('string:left', left); }
        if (typeof right === 'string') { right = new Document('string:right', right); }

        const { excerptMapper, level } = this.options;
        const leftWrappers = excerptMapper(left).map(this.wrapExcerpt);
        const rightWrappers = excerptMapper(right).map(this.wrapExcerpt);

        const hcsResult = this.hcs(this.equals, this.weigh, leftWrappers, rightWrappers);
        const similarities = this.processHCSResult(
            hcsResult,
            (l, r) => new Similarity(level, l, r),
        );

        let edits: Edit[] = [];

        const moves = this.findMoves(leftWrappers, rightWrappers);
        edits = edits.concat(moves);

        const deletions = this.processUnpairedExcerpts(
            leftWrappers,
            l => new Edit(level, EditType.Delete, l),
        );
        edits = edits.concat(deletions);

        const additions = this.processUnpairedExcerpts(
            rightWrappers,
            l => new Edit(level, EditType.Add, undefined, l),
        );
        edits = edits.concat(additions);

        return new DocumentDiff(left, right, edits, similarities);
    }

    private processHCSResult<TDiffItem>(
        hcsResult: HCSResult<Wrapper<TExcerpt>>,
        buildDiffItem: (left: Location, right: Location) => TDiffItem,
    ): TDiffItem[] {
        if (hcsResult.length === 0) return [];

        const { similarityThreshold } = this.options;
        const diffItems: TDiffItem[] = [];
        const { leftHCS, rightHCS } = hcsResult;
        const leftURI = leftHCS[0].excerpt.location.uri;
        const rightURI = rightHCS[0].excerpt.location.uri;

        let leftStart = leftHCS[0].excerpt.start;
        let leftEnd = leftStart;
        let rightStart = rightHCS[0].excerpt.start;
        let rightEnd = rightStart;
        let similarityWeight = 0;
        let toPair: Wrapper<TExcerpt>[] = [];

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
            const { excerpt: left } = leftWrapper;
            const rightWrapper = rightHCS[i];
            const { excerpt: right } = rightWrapper;

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

    private findMoves(leftWrappers: Wrapper<TExcerpt>[], rightWrappers: Wrapper<TExcerpt>[]) {
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

    private processUnpairedExcerpts<TDiffItem>(
        wrappers: Wrapper<TExcerpt>[],
        buildDiffItem: (location: Location) => TDiffItem,
    ) {
        wrappers = wrappers.filter(unpaired);
        if (wrappers.length === 0) return [];

        const edits: TDiffItem[] = [];
        const firstExcerpt = wrappers[0].excerpt;
        const uri = firstExcerpt.location.uri;
        let start = firstExcerpt.start;
        let end = start;

        const pushDiffItem = () => {
            const location = new Location(uri, new Range(start, end));
            edits.push(buildDiffItem(location));
        };

        for (const wrapper of wrappers) {
            const { excerpt } = wrapper;

            if (excerpt.start.equals(end)) {
                end = excerpt.end;
            } else {
                pushDiffItem();
                start = excerpt.start;
                end = excerpt.end;
            }
        }
        pushDiffItem();

        return edits;
    }
}

function unpaired<TExcerpt extends Excerpt>(wrapper: Wrapper<TExcerpt>) {
    return !wrapper.paired;
}

function one() {
    return 1;
}
