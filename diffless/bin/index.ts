#!/usr/bin/env node

import { exec } from 'child_process';
import { copyFileSync } from 'fs';
import { join } from 'path';
import { argv } from 'process';

import { Command } from 'commander';
import { directory as getTmpDirName } from 'tempy';

import { DiffToolRegistry } from '../';
import { buildAnnotatedHTML, readTextFile, writeTextFile } from '../cli';
import { jsonDiff } from '../languages/json';
import { registerDiffTools } from '../languages/textmate';
import { Document, DocumentDiff } from '../model';

const outputFormatters: { [outputFormat: string]: (diff: DocumentDiff) => void } = {
    gui: diff => {
        const tmpDirName = getTmpDirName();

        const htmlFilePath = join(tmpDirName, 'index.html');
        writeTextFile(htmlFilePath, buildAnnotatedHTML(diff));

        const distDir = '../../dist/';
        const jsFileName = 'index.js';
        const cssFileName = 'index.css';
        copyFileSync(join(__dirname, distDir, jsFileName), join(tmpDirName, jsFileName));
        copyFileSync(join(__dirname, distDir, cssFileName), join(tmpDirName, cssFileName));

        exec('xdg-open ' + htmlFilePath);
    },
    html: diff => console.info(buildAnnotatedHTML(diff)),
    json: diff => console.info(JSON.stringify(diff.edits)),
};

async function main() {
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
        .option(
            '--old-json-parser',
            'enable old JSON parser',
        )
        .parse(argv);

    if (!program.left || !program.right || !(program.output in outputFormatters)) {
        program.outputHelp();
        process.exit(1);
    }

    const leftDocument = new Document('file://' + program.left, readTextFile(program.left));
    const rightDocument = new Document('file://' + program.right, readTextFile(program.right));

    const registry = new DiffToolRegistry();
    if (program.oldJsonParser) {
        registry.registerExtension('.json', (_: unknown) => jsonDiff);
    } else {
        await registerDiffTools(registry);
    }

    const diffTool = registry.getByExtension(program.left, program.right)(program);
    const documentDiff = diffTool(leftDocument, rightDocument);
    outputFormatters[program.output](documentDiff);

    process.exit(0);
}

main().then(console.log).catch(console.error);
