import { bind } from 'decko';
import { partition, reduce } from 'lodash';
import { Component, h } from 'preact';

import { Document, Edit, EOL, Position, Range } from '../../../model';
import { buildEditIndexes, EditIndex, sortEdits } from '../../../util';

import DocumentView from '../document-view';
import EditView from '../edit-view';
import LineView from '../line-view';

export interface Props {
    left: Document;
    right: Document;
    edits: Edit[];
    enabledDiffLevels: boolean[];
    enabledEditTypes: boolean[];
    highlightedEdit?: Edit;
    setHighlightedEdit: (edit?: Edit) => void;
}

export default class SideBySideFileDiff extends Component<Props> {
    readonly leftEditIndex: EditIndex;
    readonly rightEditIndex: EditIndex;

    constructor(props: Props) {
        super(props);
        [this.leftEditIndex, this.rightEditIndex] = buildEditIndexes(this.props.edits);
    }

    render() {
        const { left, right } = this.props;
        return (
            <div className="SideBySideFileDiff">
                <div className="SideBySideFileDiff-left">{this.buildSide(left, this.leftEditIndex)}</div>
                <div className="SideBySideFileDiff-right">{this.buildSide(right, this.rightEditIndex)}</div>
            </div>
        );
    }

    buildSide(document: Document, editIndex: EditIndex) {
        const { characters } = document;
        const pendingEdits = new Set();

        let lines: JSX.Element[] = [];
        let cursor = new Position(1, 1);
        let currentLineChildren: JSX.Element[] = [];
        for (const character of characters) {
            const { position, content } = character;
            const editsHere = editIndex.get(position);
            const hasEditsHere = editsHere.length > 0;
            const isEOL = content === EOL;
            if (!hasEditsHere && !isEOL) continue;

            const range = new Range(cursor, position);
            currentLineChildren.push(this.withEdits(document, range, pendingEdits));

            if (hasEditsHere) {
                updatePendingEdits(editsHere, pendingEdits);
                cursor = position;
            }

            if (isEOL) {
                lines = lines.concat(buildLine(position.line, currentLineChildren));
                currentLineChildren = [];
                cursor = new Position(cursor.line + 1, 1);
            }
        }

        return <DocumentView document={document}>{lines}</DocumentView>;
    }

    withEdits(document: Document, range: Range, pendingEdits: Set<Edit>): any {
        let wrapped: any = document.getRange(range);

        if (pendingEdits.size > 0) {
            const sortedEdits = Array.from(pendingEdits);
            sortEdits(sortedEdits);

            const { enabledDiffLevels, enabledEditTypes, highlightedEdit } = this.props;
            wrapped = reduce(sortedEdits, (prev, curr) => (
                <EditView
                    edit={curr}
                    enabled={enabledDiffLevels[curr.level] && enabledEditTypes[curr.type]}
                    highlighted={highlightedEdit === curr}
                    toggleEditHighlight={this.toggleEditHighlight}
                >
                    {prev}
                </EditView>
            ), wrapped);
        }
        return wrapped;
    }

    @bind
    toggleEditHighlight(edit: Edit, mouseIsOver: boolean) {
        this.props.setHighlightedEdit(mouseIsOver ? edit : undefined);
    }
}

function updatePendingEdits(editsHere: Edit[], pendingEdits: Set<Edit>) {
    const [endingEdits, startingEdits] = partition(editsHere, c => pendingEdits.has(c));
    for (const edit of endingEdits) {
        pendingEdits.delete(edit);
    }
    for (const edit of startingEdits) {
        pendingEdits.add(edit);
    }
}

function buildLine(lineNumber: number, currentLineChildren: JSX.Element[]): JSX.Element {
    return <LineView number={lineNumber}>{currentLineChildren}</LineView>;
}
