import { ArrayDiffTool } from '../array/diff';
import { characterDiff, lineDiff } from '../index';
import { DiffLevel, Document } from '../model';
import { announceHtml } from '../tests/test-util';
import { stripMargin } from '../util';

describe('array/diff', () => {
    describe('charactersDiff', () => {
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

            const diff = characterDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            expect(diff.similarities).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'basic');
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

            const diff = characterDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'moves1');
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

            const diff = characterDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'moves2');
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

            const diff = characterDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'moves3');
        });
    });

    describe('lineDiff', () => {
        const left = new Document('string:left', stripMargin
            `abc
            |def
            |ghijklmn`,
        );
        const right = new Document('string:right', stripMargin
            `abc
            |ghijklmn
            |def`,
        );

        it('should consider line weight', () => {
            const diff = lineDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'move_lines_weighed');
        });

        it('should be possible to use no weight', () => {
            const tool = new ArrayDiffTool({
                level: DiffLevel.Textual,
                similarityThreshold: 0,
                toGrainArray: d => d.lines,
                weigh: _ => 1,
            });
            const diff = tool.run(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'move_lines_not_weighed');
        });

        it('should be able to compare strings directly', () => {
            const otherLeft = stripMargin
            `"m"
            |"z"
            |"j"
            |"a"
            |"w"
            |"x"
            |"u"`;

            const otherRight = stripMargin
            `"a"
            |"j"
            |"m"
            |"u"
            |"w"
            |"x"
            |"z"`;

            const diff = lineDiff(otherLeft, otherRight);

            expect(diff.edits).toMatchSnapshot();
            announceHtml(diff.left, diff.right, diff.edits, 'strings');
        });
    });
});
