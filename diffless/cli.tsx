import { readFileSync, writeFileSync } from 'fs';
import { h } from 'preact';
import { render } from 'preact-render-to-string';

import { charactersDiff } from '.';
import FileDiff from './html/components/file-diff';
import { JSIN } from './jsin';
import { DiffLevel, Document, Edit, EditType, Location } from './model';
import { stripMargin } from './util';

export function annotateWithDiff(leftPath: string, rightPath: string) {
    const left = new Document('file://' + leftPath, readTextFile(leftPath));
    const right = new Document('file://' + rightPath, readTextFile(rightPath));

    const documentDiff = charactersDiff(
        left,
        right,
    );

    return buildAnnotatedHTML(left, right, documentDiff.edits);
}

function readTextFile(path: string, encoding: string = 'utf8') {
    return readFileSync(path, { encoding });
}

export function buildAnnotatedHTML(
    left: Document,
    right: Document,
    edits: Edit[],
) {
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

export function annotateWithEditsFile(leftPath: string, rightPath: string, editsPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const jsonEdits = JSIN.parse(readTextFile(editsPath)) as JsonEdit[];
    const edits = jsonEdits.map(c => toEdit(c));

    return buildAnnotatedHTML(left, right, edits);
}

interface JsonEdit {
    right?: Location;
    left?: Location;
    level: keyof typeof DiffLevel;
    type: keyof typeof EditType;
}

function toEdit(objFromJson: JsonEdit): Edit {
    return {
        ...objFromJson,
        level: DiffLevel[objFromJson.level],
        type: EditType[objFromJson.type],
    };
}

export function saveAnnotatedHtml(
    left: Document,
    right: Document,
    edits: Edit[],
    outputPath: string,
) {
    writeTextFile(outputPath, buildAnnotatedHTML(left, right, edits));
}

function writeTextFile(path: string, content: string, encoding: string = 'utf8') {
    return writeFileSync(path, content, { encoding });
}
