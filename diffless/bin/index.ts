#!/usr/bin/env node

import { exec } from 'child_process';
import { Command } from 'commander';
import { getType } from 'mime';
import { argv } from 'process';
import { file as getTmpFileName } from 'tempy';

import { getDiffTool, registerDiffTool } from '../';
import { buildAnnotatedHTML, readTextFile, writeTextFile } from '../cli';
import { jsonDiff } from '../languages/json';
import { DEFAULT_CONTENT_TYPE, Document, DocumentDiff } from '../model';

const outputFormatters: { [outputFormat: string]: (diff: DocumentDiff) => void } = {
    gui: diff => {
        const tmpFileName = getTmpFileName({ extension: 'html' });
        writeTextFile(tmpFileName, buildAnnotatedHTML(diff));
        exec('xdg-open ' + tmpFileName);
    },
    html: diff => console.info(buildAnnotatedHTML(diff)),
    json: diff => console.info(JSON.stringify(diff.edits)),
};

registerDiffTool('application/json', _ => jsonDiff);

const program = new Command();
program
    .version('0.0.1')
    .arguments('<left> <right>')
    .action((left, right) => {
        program.left = left;
        program.right = right;
    })
    .option(
        '-o, --output <format>',
        `output format. One of: ${Object.keys(outputFormatters).join('|')}`,
        'gui',
    )
    .parse(argv);

if (!program.left || !program.right || !(program.output in outputFormatters)) {
    program.outputHelp();
    process.exit(1);
}

let leftContentType = getType(program.left) || DEFAULT_CONTENT_TYPE;
let rightContentType = getType(program.right) || DEFAULT_CONTENT_TYPE;

if (leftContentType !== rightContentType) {
    console.warn(
        `Content type mismatch: left is ${leftContentType}, right is ${rightContentType}. ` +
        `Defaulting to ${DEFAULT_CONTENT_TYPE}`,
    );
    leftContentType = rightContentType = DEFAULT_CONTENT_TYPE;
}

const leftDocument = new Document('file://' + program.left, readTextFile(program.left), leftContentType);
const rightDocument = new Document('file://' + program.right, readTextFile(program.right), rightContentType);

const diffTool = getDiffTool(leftContentType, program);
const documentDiff = diffTool(leftDocument, rightDocument);

outputFormatters[program.output](documentDiff);
