import { bind } from 'decko';
import { partition, reduce } from 'lodash';
import { Component, h } from 'preact';

import { Change, Document, EOL, Position, Range } from '../../../model';
import { buildChangeIndexes, ChangeIndex, sortChanges } from '../../../util';

import ChangeView from '../change-view';
import DocumentView from '../document-view';
import LineView from '../line-view';

export interface Props {
    left: Document;
    right: Document;
    changes: Change[];
    enabledChangeLevels: boolean[];
    enabledChangeTypes: boolean[];
    highlightedChange?: Change;
    setHighlightedChange: (change?: Change) => void;
}

export default class SideBySideFileDiff extends Component<Props> {
    readonly leftChangeIndex: ChangeIndex;
    readonly rightChangeIndex: ChangeIndex;

    constructor(props: Props) {
        super(props);
        [this.leftChangeIndex, this.rightChangeIndex] = buildChangeIndexes(this.props.changes);
    }

    render() {
        const { left, right } = this.props;
        return (
            <div className="SideBySideFileDiff">
                <div className="SideBySideFileDiff-left">{this.buildSide(left, this.leftChangeIndex)}</div>
                <div className="SideBySideFileDiff-right">{this.buildSide(right, this.rightChangeIndex)}</div>
            </div>
        );
    }

    buildSide(document: Document, changeIndex: ChangeIndex) {
        const { characters } = document;
        const pendingChanges = new Set();

        let lines: JSX.Element[] = [];
        let cursor = new Position(1, 1);
        let currentLineChildren: JSX.Element[] = [];
        for (const character of characters) {
            const { position, value } = character;
            const changesHere = changeIndex.get(position);
            if (changesHere.length === 0 && value !== EOL) continue;

            const range = new Range(cursor, position);
            currentLineChildren.push(this.withChanges(document, range, pendingChanges));

            if (changesHere.length > 0) {
                updatePendingChanges(changesHere, pendingChanges);
                cursor = position;
            }

            if (value === EOL) {
                lines = lines.concat(buildLine(position.line, currentLineChildren));
                currentLineChildren = [];
                cursor = new Position(cursor.line + 1, 1);
            }
        }

        return <DocumentView document={document}>{lines}</DocumentView>;
    }

    withChanges(document: Document, range: Range, pendingChanges: Set<Change>): any {
        let wrapped: any = document.getRange(range);

        if (pendingChanges.size > 0) {
            const sortedChanges = Array.from(pendingChanges);
            sortChanges(sortedChanges);

            const { enabledChangeLevels, enabledChangeTypes, highlightedChange } = this.props;
            wrapped = reduce(sortedChanges, (prev, curr) => (
                <ChangeView
                    change={curr}
                    enabled={enabledChangeLevels[curr.level] && enabledChangeTypes[curr.type]}
                    highlighted={highlightedChange === curr}
                    toggleChangeHighlight={this.toggleChangeHighlight}
                >
                    {prev}
                </ChangeView>
            ), wrapped);
        }
        return wrapped;
    }

    @bind
    toggleChangeHighlight(change: Change, mouseIsOver: boolean) {
        this.props.setHighlightedChange(mouseIsOver ? change : undefined);
    }
}

function updatePendingChanges(changesHere: Change[], pendingChanges: Set<Change>) {
    const [endingChanges, startingChanges] = partition(changesHere, c => pendingChanges.has(c));
    for (const change of endingChanges) {
        pendingChanges.delete(change);
    }
    for (const change of startingChanges) {
        pendingChanges.add(change);
    }
}

function buildLine(lineNumber: number, currentLineChildren: JSX.Element[]): JSX.Element {
    return <LineView number={lineNumber}>{currentLineChildren}</LineView>;
}
