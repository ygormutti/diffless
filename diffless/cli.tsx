import { readFileSync, writeFileSync } from 'fs';

import { h } from 'preact';
import { render } from 'preact-render-to-string';

import FileDiff from './html/components/file-diff';
import { JSIN } from './jsin';
import { Document, DocumentDiff, Edit } from './model';
import { stripMargin } from './util';

export function readTextFile(path: string, encoding: string = 'utf8') {
    return readFileSync(path, { encoding });
}

export function buildAnnotatedHTML(diff: DocumentDiff): string;
export function buildAnnotatedHTML(left: Document, right: Document, edits: Edit[]): string;
export function buildAnnotatedHTML(leftOrDiff: DocumentDiff | Document, right?: Document, edits?: Edit[]) {
    let left: Document;
    if (leftOrDiff instanceof DocumentDiff) {
        left = leftOrDiff.left;
        right = leftOrDiff.right;
        edits = leftOrDiff.edits;
    } else {
        left = leftOrDiff;
        right = right!;
        edits = edits!;
    }

    const diffHtml = render(<FileDiff left={left} right={right} edits={edits} />);
    const props = { edits, left, right };

    return stripMargin
        `<html>
        |<head>
        |    <title>diffless</title>
        |    <meta charset="utf-8" />
        |    <link rel="stylesheet" href="index.css" />
        |</head>
        |<body>
        |
        |<div id="diff">
        |${diffHtml}
        |</div>
        |
        |<script>window.props = ${JSIN.stringify(JSIN.stringify(props))};</script>
        |<script src="index.js"></script>
        |</body>
        |</html>`;
}

export function saveAnnotatedHtml(
    left: Document,
    right: Document,
    edits: Edit[],
    outputPath: string,
) {
    writeTextFile(outputPath, buildAnnotatedHTML(left, right, edits));
}

export function writeTextFile(path: string, content: string, encoding: string = 'utf8') {
    return writeFileSync(path, content, { encoding });
}
