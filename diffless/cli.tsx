import { readFileSync } from 'fs';
import { join } from 'path';
import { h } from 'preact';
import { render } from 'preact-render-to-string';

import { charactersDiff } from './array-diff';
import FileDiff from './html/components/file-diff';
import { dynamicProgrammingLCS } from './lcs';
import { Change, ChangeLevel, ChangeType, Document, Location } from './model';
import { stripMargin } from './util';

export function annotateWithDiff(leftPath: string, rightPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const changes = charactersDiff(
        dynamicProgrammingLCS,
        left,
        right,
    );

    return buildAnnotatedHTML(left, right, changes);
}

function readTextFile(path: string, encoding: string = 'utf8') {
    return readFileSync(path, { encoding });
}

export function buildAnnotatedHTML(
    left: Document,
    right: Document,
    changes: Change[],
) {
    const diffHtml = render(<FileDiff left={left} right={right} changes={changes} />);
    const props = { changes, left, right };

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
        |<script>window.props = ${JSON.stringify(props).replace(/<|>/g, '')};</script>
        |<script src="index.js"></script>
        |</body>
        |</html>`;
}

export function annotateWithChangesFile(leftPath: string, rightPath: string, changesPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const jsonChanges = JSON.parse(readTextFile(changesPath)) as JsonChange[];
    const changes = jsonChanges.map(c => toChange(c));

    return buildAnnotatedHTML(left, right, changes);
}

interface JsonChange {
    right?: Location;
    left?: Location;
    level: keyof typeof ChangeLevel;
    type: keyof typeof ChangeType;
}

function toChange(objFromJson: JsonChange): Change {
    return {
        ...objFromJson,
        level: ChangeLevel[objFromJson.level],
        type: ChangeType[objFromJson.type],
    };
}
