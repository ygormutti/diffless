import { Document } from '../model';

describe('model', () => {
    describe('Document', () => {
        const uri = 'string:test';
        const multilineString = 'ac\ndc\r\nb\rc';

        it('should build array of characters correctly', () => {
            const document = new Document(uri, multilineString);
            expect(document.characters).toMatchSnapshot();
        });
    });
});
