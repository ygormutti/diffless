import { fixtureDocument } from '../../../tests/test-util';
import { tokenize } from '../lexer';

describe('lexer', () => {
    describe('tokenize', () => {
        it('should match snapshot', () => {
            const document = fixtureDocument('textual_changes/before.json');
            expect(tokenize(document)).toMatchSnapshot();
        });

        it('should match snapshot', () => {
            const document = fixtureDocument('textual_changes/after.json');
            expect(tokenize(document)).toMatchSnapshot();
        });
    });
});
