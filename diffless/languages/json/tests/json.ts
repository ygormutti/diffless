import { announceHtml, fixtureDocument } from '../../../tests/test-util';
import { jsonDiff, jsonLexicalDiff } from '../index';

describe('JSON support', () => {
    const mapReorderLeft = fixtureDocument('single_map_reorder/before.json');
    const mapReorderRight = fixtureDocument('single_map_reorder/after.json');

    describe('jsonLexicalDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonLexicalDiff(mapReorderLeft, mapReorderRight);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(mapReorderLeft, mapReorderRight, diff.edits, 'json_lexical_1');
        });
    });

    describe('jsonDiff', () => {
        it('should match snapshot', () => {
            const diff = jsonDiff(mapReorderLeft, mapReorderRight);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(mapReorderLeft, mapReorderRight, diff.edits, 'json_1');
        });

        it('should match snapshot', () => {
            const left = fixtureDocument('textual_changes/before.json');
            const right = fixtureDocument('textual_changes/after.json');

            const diff = jsonDiff(left, right);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'textual_vs_json_1');
        });

        it('should match snapshot', () => {
            const left = fixtureDocument('mostly_formatting/before.json');
            const right = fixtureDocument('mostly_formatting/after.json');

            const diff = jsonDiff(left, right);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'mostly_formatting');
        });
    });
});
