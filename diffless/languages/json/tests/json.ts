import { readTextFile } from '../../../cli';
import { Document } from '../../../model';
import { announceHtml, fixture } from '../../../tests/test-util';
import { jsonDiff, jsonLexicalDiff } from '../index';

describe('JSON support', () => {
    const leftPath = fixture('single_map_reorder/before.json');
    const rightPath = fixture('single_map_reorder/after.json');
    const left = new Document('file://' + leftPath, readTextFile(leftPath));
    const right = new Document('file://' + rightPath, readTextFile(rightPath));

    describe('jsonLexicalDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonLexicalDiff(left, right);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'json_lexical_1');
        });
    });

    describe('jsonDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonDiff(left, right);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'json_1');
        });
    });
});
