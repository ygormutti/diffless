import { annotateWithChangesFile, annotateWithDiff } from '../cli';
import { fixture } from './test-util';

describe('annotateWithDiff', () => {
    it('should work with diff', () => {
        const result = annotateWithDiff(
            fixture('single_map_reorder/before.json'),
            fixture('single_map_reorder/after.json'),
        );
        expect(result).toMatchSnapshot();
    });
});

describe('annotateWithChangesFile', () => {
    it('should match snapshot', () => {
        const result = annotateWithChangesFile(
            fixture('single_map_reorder/before.json'),
            fixture('single_map_reorder/after.json'),
            fixture('single_map_reorder/changes.json'),
        );
        expect(result).toMatchSnapshot();
    });
});
