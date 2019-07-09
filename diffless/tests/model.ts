import { Document, Position, Range } from '../model';

describe('model', () => {
    describe('Document', () => {
        const uri = 'string:test';
        const multilineString = 'ac\ndc\r\nb\rc';
        const document = new Document(uri, multilineString);

        it('should build array of characters correctly', () => {
            expect(document).toMatchSnapshot();
        });

        it('should get empty ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(1, 1));
            expect(document.getRange(range)).toBe('');
        });

        it('should get end of line correctly', () => {
            const range = new Range(new Position(1, 3), new Position(2, 1));
            expect(document.getRange(range)).toBe('\n');
        });

        it('should get one line ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(1, 3));
            expect(document.getRange(range)).toBe('ac');
        });

        it('should get two line ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(2, 2));
            expect(document.getRange(range)).toBe('ac\nd');
        });

        it('should get multiline ranges correctly', () => {
            const range = new Range(new Position(1, 1), new Position(3, 1));
            expect(document.getRange(range)).toBe('ac\ndc\n');
        });

        it('should have contiguous lines', () => {
            let lastLineEnd;
            for (const line of document.lines) {
                if (lastLineEnd) {
                    expect(line.start.equals(lastLineEnd));
                }
                lastLineEnd = line.end;
            }
        });

        it('should have contiguous characters', () => {
            let lastCharacterEnd;
            for (const character of document.characters) {
                if (lastCharacterEnd) {
                    expect(character.start.equals(lastCharacterEnd));
                }
                lastCharacterEnd = character.end;
            }
        });
    });
});
