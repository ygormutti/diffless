import { resolve } from 'path';

import { saveAnnotatedHtml } from '../cli';
import { Change, Document } from '../model';

export function fixture(path: string) {
    return `diffless/tests/fixtures/${path}`;
}

let seed = 0;
export function announceHtml(left: Document, right: Document, changes: Change[], name?: string) {
    const outputPath = `dist/tmp_${name || seed++}.html`;
    saveAnnotatedHtml(left, right, changes, outputPath);
    console.info(`HTML saved at: ${resolve(outputPath)}`);
}
