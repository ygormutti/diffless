import { annotateWithChangesFile, annotateWithDiff } from '../io';

describe('annotateWithDiff', () => {
    it('should work with diff', () => {
        const result = annotateWithDiff(
            'examples/json/before.json',
            'examples/json/single_map_reorder/after.json',
        );
        expect(result).toMatchSnapshot();
    });
});

describe('annotateWithChangesFile', () => {
    it('should match snapshot', () => {
        const result = annotateWithChangesFile(
            'examples/json/before.json',
            'examples/json/single_map_reorder/after.json',
            'examples/json/single_map_reorder/changes.json',
        );
        expect(result).toMatchSnapshot();
    });
});
