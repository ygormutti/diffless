import {
    DiffLevel,
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

export class ArrayDiffOptions<TExcerpt extends Excerpt> {
    constructor(
        readonly level: DiffLevel,
        readonly excerptMapper: ExcerptMapper<TExcerpt>,
        readonly similarityThreshold: number,
        readonly equals: Equals<TExcerpt> = Excerpt.sameContent,
        readonly weigh: Weigh<TExcerpt> = Excerpt.contentLength,
        readonly hcs: HCS = dynamicProgrammingHCS,
    ) { }
}

export type ExcerptMapper<TExcerpt extends Excerpt> = (document: Document) => TExcerpt[];

export function arrayDiff<TExcerpt extends Excerpt>(
    options: ArrayDiffOptions<TExcerpt>,
    left: Document,
    right: Document,
) {
    const { level, equals, weigh, excerptMapper, similarityThreshold, hcs } = options;
    const leftWrapped = excerptMapper(left).map(wrapExcerpt);
    const rightWrapped = excerptMapper(right).map(wrapExcerpt);
    const equalsWrapped = wrapEquals(equals);
    const weighWrapped = wrapWeigh(weigh);

    const hcsResult = hcs(equalsWrapped, weighWrapped, leftWrapped, rightWrapped);
    const similarities = processHCSResult(
        hcsResult,
        similarityThreshold,
        weigh,
        (l, r) => new Similarity(level, l, r),
    );

    let edits: Edit[] = [];

    const moves = findMoves(options, equalsWrapped, leftWrapped, rightWrapped);
    edits = edits.concat(moves);

    const deletions = leftWrapped.filter(unpaired).map(
        i => new Edit(level, EditType.Delete, i.excerpt.location),
    );
    edits = edits.concat(deletions);

    const additions = rightWrapped.filter(unpaired).map(
        i => new Edit(level, EditType.Add, undefined, i.excerpt.location),
    );
    edits = edits.concat(additions);

    return new DocumentDiff(left, right, edits, similarities);
}

class ExcerptWrapper<TExcerpt extends Excerpt> {
    constructor(
        readonly excerpt: TExcerpt,
        public paired: boolean = false,
    ) { }
}

function wrapExcerpt<TExcerpt extends Excerpt>(excerpt: TExcerpt): ExcerptWrapper<TExcerpt> {
    return new ExcerptWrapper(excerpt);
}

function wrapEquals<TExcerpt extends Excerpt>(equals: Equals<TExcerpt>) {
    return (a: ExcerptWrapper<TExcerpt>, b: ExcerptWrapper<TExcerpt>) => equals(a.excerpt, b.excerpt);
}

function wrapWeigh<TExcerpt extends Excerpt>(weigh: Weigh<TExcerpt>) {
    return (obj: ExcerptWrapper<TExcerpt>) => weigh(obj.excerpt);
}

function processHCSResult<TExcerpt extends Excerpt, TDiffItem>(
    hcsResult: HCSResult<ExcerptWrapper<TExcerpt>>,
    similarityThreshold: number,
    weigh: Weigh<TExcerpt>,
    buildDiffItem: (left: Location, right: Location) => TDiffItem,
): TDiffItem[] {
    if (hcsResult.length === 0) return [];
    const diffItems: TDiffItem[] = [];
    const { leftHCS, rightHCS } = hcsResult;
    const leftURI = leftHCS[0].excerpt.location.uri;
    const rightURI = rightHCS[0].excerpt.location.uri;

    let leftStart = leftHCS[0].excerpt.start;
    let leftEnd = leftStart;
    let rightStart = rightHCS[0].excerpt.start;
    let rightEnd = rightStart;
    let similarityWeight = 0;
    let toPair: ExcerptWrapper<TExcerpt>[] = [];

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
            similarityWeight += weigh(left);
            toPair.push(rightWrapper);
            toPair.push(leftWrapper);
        } else {
            checkForDiffItem();
            similarityWeight = weigh(left);
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

function findMoves<TExcerpt extends Excerpt>(
    options: ArrayDiffOptions<TExcerpt>,
    equalsWrapped: Equals<ExcerptWrapper<TExcerpt>>,
    leftWrappers: ExcerptWrapper<TExcerpt>[],
    rightWrappers: ExcerptWrapper<TExcerpt>[],
) {
    const { hcs, similarityThreshold, weigh, level } = options;
    const lcsUnpaired = () => {
        leftWrappers = leftWrappers.filter(unpaired);
        rightWrappers = rightWrappers.filter(unpaired);
        return hcs(equalsWrapped, one, leftWrappers, rightWrappers);
    };

    let moves: Edit[] = [];
    let lcsResult = lcsUnpaired();
    let previousWeight = Infinity;
    while (lcsResult.weight < previousWeight) {
        previousWeight = lcsResult.weight;

        moves = moves.concat(processHCSResult(
            lcsResult,
            similarityThreshold,
            weigh,
            (l, r) => new Edit(level, EditType.Move, l, r),
        ));

        lcsResult = lcsUnpaired();
    }
    return moves;
}

function unpaired<TExcerpt extends Excerpt>(wrapper: ExcerptWrapper<TExcerpt>) {
    return !wrapper.paired;
}

function one() {
    return 1;
}
