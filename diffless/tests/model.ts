import { Document, Position, Range } from '../model';

describe('model', () => {
    describe('Document', () => {
        const uri = 'string:test';
        const multilineString = 'ac\ndc\r\nb\rc';
        const document = new Document(uri, multilineString);

        it('should build array of characters correctly', () => {
            expect(document).toMatchSnapshot();
        });

        it('shoud get empty ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(1, 1));
            expect(document.getRange(range)).toBe('');
        });

        it('shoud get end of line correctly', () => {
            const range = new Range(new Position(1, 3), new Position(2, 1));
            expect(document.getRange(range)).toBe('\n');
        });

        it('shoud get one line ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(1, 3));
            expect(document.getRange(range)).toBe('ac');
        });

        it('shoud get two line ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(2, 2));
            expect(document.getRange(range)).toBe('ac\nd');
        });

        it('shoud get multiline ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(3, 1));
            expect(document.getRange(range)).toBe('ac\ndc\n');
        });
    });
});
