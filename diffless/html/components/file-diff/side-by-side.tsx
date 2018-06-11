import { Component, h } from 'preact';
import { Change, Document } from '../../../model';
import { ChangeIndex } from '../../../util';

import DocumentView from '../document-view';
import LineView from '../line-view';

export interface Props {
    left: Document;
    right: Document;
    changes: Change[];
    enabledChangeLevels: boolean[];
    enabledChangeTypes: boolean[];
    highlightedChange?: Change;
}

function Side(document: Document) {
    const lines = document.lines.map((line, idx) =>
        <LineView number={idx + 1}>{line}</LineView>,
    );

    return <DocumentView document={document}> {lines} </DocumentView>;
}

export default function SideBySideFileDiff(props: Props) {
    return (
        <div className="SideBySideFileDiff">
            <div className="SideBySideFileDiff-left">
                {Side(props.left)}
            </div>
            <div className="SideBySideFileDiff-right">
                {Side(props.right)}
            </div>
        </div>
    );
}
