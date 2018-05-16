import { annotateWithChangesFile, annotateWithDiff } from '../io';

describe('annotateWithDiff', () => {
    it('should work with diff', () => {
        const result = annotateWithDiff(
            'diffless/tests/fixtures/single_map_reorder/before.json',
            'diffless/tests/fixtures/single_map_reorder/after.json',
        );
        expect(result).toMatchSnapshot();
    });
});

describe('annotateWithChangesFile', () => {
    it('should match snapshot', () => {
        const result = annotateWithChangesFile(
            'diffless/tests/fixtures/single_map_reorder/before.json',
            'diffless/tests/fixtures/single_map_reorder/after.json',
            'diffless/tests/fixtures/single_map_reorder/changes.json',
        );
        expect(result).toMatchSnapshot();
    });
});
