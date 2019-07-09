import { buildAnnotatedHTML, readTextFile } from '../cli';
import { characterDiff } from '../index';
import { Document } from '../model';

const { argv } = process;

export function annotateWithDiff(leftPath: string, rightPath: string) {
    const left = new Document('file://' + leftPath, readTextFile(leftPath));
    const right = new Document('file://' + rightPath, readTextFile(rightPath));

    const documentDiff = characterDiff(left, right);
    return buildAnnotatedHTML(documentDiff);
}

console.info(annotateWithDiff(argv[2], argv[3]));
