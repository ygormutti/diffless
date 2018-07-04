import { readTextFile } from '../../../cli';
import { Document } from '../../../model';
import { announceHtml, fixture } from '../../../tests/test-util';
import { jsonDiff, jsonLexicalDiff } from '../index';

describe('JSON support', () => {
    const mapReorderleftPath = fixture('single_map_reorder/before.json');
    const mapReorderRightPath = fixture('single_map_reorder/after.json');
    const mapReorderleft = new Document('file://' + mapReorderleftPath, readTextFile(mapReorderleftPath));
    const mapReorderRight = new Document('file://' + mapReorderRightPath, readTextFile(mapReorderRightPath));

    describe('jsonLexicalDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonLexicalDiff(mapReorderleft, mapReorderRight);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(mapReorderleft, mapReorderRight, diff.edits, 'json_lexical_1');
        });
    });

    describe('jsonDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonDiff(mapReorderleft, mapReorderRight);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(mapReorderleft, mapReorderRight, diff.edits, 'json_1');
        });

        it('should match snapshot', () => {
            const leftPath = fixture('textual_changes/before.json');
            const rightPath = fixture('textual_changes/after.json');
            const left = new Document('file://' + leftPath, readTextFile(leftPath));
            const right = new Document('file://' + rightPath, readTextFile(rightPath));

            const diff = jsonDiff(left, right);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'textual_vs_json_1');
        });
    });
});
