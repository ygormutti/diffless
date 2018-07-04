import { readTextFile } from '../../../cli';
import { Document } from '../../../model';
import { fixture } from '../../../tests/test-util';
import { tokenize } from '../lexer';

describe('lexer', () => {
    describe('tokenize', () => {
        it('should match snapshot', () => {
            const path = fixture('textual_changes/before.json');
            const document = new Document('file://' + path, readTextFile(path));

            expect(tokenize(document)).toMatchSnapshot();
        });

        it('should match snapshot', () => {
            const path = fixture('textual_changes/after.json');
            const document = new Document('file://' + path, readTextFile(path));

            expect(tokenize(document)).toMatchSnapshot();
        });
    });
});
