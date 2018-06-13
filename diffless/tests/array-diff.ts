import { charactersDiff } from '../array-diff';
import { dynamicProgrammingLCS } from '../lcs';
import { ChangeLevel, Character, Document } from '../model';
import { stripMargin } from '../util';
import { announceHtml } from './test-util';

describe('array-diff', () => {
    describe('charactersDiff', () => {
        const diff = charactersDiff(dynamicProgrammingLCS);

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

            const changes = diff(left, right);
            expect(changes).toMatchSnapshot();
            announceHtml(left, right, changes, 'basic');
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

            const changes = diff(left, right);
            expect(changes).toMatchSnapshot();
            announceHtml(left, right, changes, 'moves1');
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

            const changes = diff(left, right);
            expect(changes).toMatchSnapshot();
            announceHtml(left, right, changes, 'moves2');

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

            const changes = diff(left, right);
            expect(changes).toMatchSnapshot();
            announceHtml(left, right, changes, 'moves3');
        });
    });
});
