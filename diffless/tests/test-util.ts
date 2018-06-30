import { resolve } from 'path';

import { saveAnnotatedHtml } from '../cli';
import { Document, Edit } from '../model';

export function fixture(path: string) {
    return `diffless/tests/fixtures/${path}`;
}

let seed = 0;
export function announceHtml(left: Document, right: Document, edits: Edit[], name?: string) {
    const outputPath = `dist/tmp_${name || seed++}.html`;
    saveAnnotatedHtml(left, right, edits, outputPath);
    console.info(`HTML saved at: ${resolve(outputPath)}`);
}
