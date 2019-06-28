import { ArrayDiffTool } from '../array/diff';
import { characterDiff, lineDiff } from '../index';
import { DiffLevel, Document } from '../model';
import { announceHtml, fixtureDocument } from '../tests/test-util';
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
        it('should consider line weight', () => {
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

            const diff = lineDiff(left, right);
            expect(diff.edits).toMatchSnapshot();
            announceHtml(left, right, diff.edits, 'move_lines_weighed');
        });

        it('should be possible to use no weight', () => {
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

            const tool = new ArrayDiffTool({
                level: DiffLevel.Textual,
                similarityThreshold: 0,
                toAtomArray: d => d.lines,
                weigh: _ => 1,
            });
            const diff = tool.compare(left, right);
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

        it('should be able to compare strings directly', () => {
            // from: https://news.ycombinator.com/item?id=13987217
            const otherLeft = stripMargin
                `a
                |b
                |c
                |1
                |2
                |3
                |x
                |y
                |z
                |`;

            const otherRight = stripMargin
                `x
                |y
                |z
                |1
                |2
                |3
                |a
                |b
                |c
                |`;

            const diff = lineDiff(otherLeft, otherRight);

            expect(diff.edits).toMatchSnapshot(); // FIXME result is wrong
            announceHtml(diff.left, diff.right, diff.edits, 'move-fail');
        });

        it('should produce good quality diff', () => {
            // from: https://bramcohen.livejournal.com/73318.html
            const left = fixtureDocument('patience/before.c');
            const right = fixtureDocument('patience/after.c');

            const diff = lineDiff(left, right);

            expect(diff.edits).toMatchSnapshot(); // FIXME result is poor
            announceHtml(diff.left, diff.right, diff.edits, 'patience');
        });

        it('should produce good quality diff', () => {
            // from: https://alfedenzo.livejournal.com/170301.html
            const left = fixtureDocument('frobnitz/before.c');
            const right = fixtureDocument('frobnitz/after.c');

            const diff = lineDiff(left, right);

            expect(diff.edits).toMatchSnapshot(); // FIXME result is poor
            announceHtml(diff.left, diff.right, diff.edits, 'frobnitz');
        });
    });
});
