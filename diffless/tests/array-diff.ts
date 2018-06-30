import { charactersDiff } from '../index';
import { Document } from '../model';
import { stripMargin } from '../util';
import { announceHtml } from './test-util';

describe('array-diff', () => {
    describe('charactersDiff', () => {
        const diff = charactersDiff;

        it('should detect additions and deletions correctly', () => {
            const left = new Document('string:left', stripMargin
                `abc
                |d
                |efg`,
            );
            const right = new Document('string:right', stripMargin
                `bc
                |de
                |fgh`,
            );

            const edits = diff(left, right);
            expect(edits.edits).toMatchSnapshot();
            announceHtml(left, right, edits.edits, 'basic');
        });

        it('should detect moves correctly 1', () => {
            const left = new Document('string:left', stripMargin
                `abc
                |def`,
            );
            const right = new Document('string:right', stripMargin
                `def
                |abc`,
            );

            const edits = diff(left, right);
            expect(edits.edits).toMatchSnapshot();
            announceHtml(left, right, edits.edits, 'moves1');
        });

        it('should detect moves correctly 2', () => {
            const left = new Document('string:left', stripMargin
                `abc
                |def
                |ghi`,
            );
            const right = new Document('string:right', stripMargin
                `def
                |gabc
                |ghi`,
            );

            const edits = diff(left, right);
            expect(edits.edits).toMatchSnapshot();
            announceHtml(left, right, edits.edits, 'moves2');

        });

        it('should detect moves correctly 3', () => {
            const left = new Document('string:left', stripMargin
                `abc
                |def
                |ghi`,
            );
            const right = new Document('string:right', stripMargin
                `abc
                |ghi
                |def`,
            );

            const edits = diff(left, right);
            expect(edits.edits).toMatchSnapshot();
            announceHtml(left, right, edits.edits, 'moves3');
        });
    });
});
