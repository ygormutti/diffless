import { ArrayDiffTool } from '../../array/diff';
import { DiffLevel } from '../../model';
import { tokenize } from './lexer';

const jsonLexicalDiffTool = new ArrayDiffTool({
    excerptMapper: tokenize,
    level: DiffLevel.Lexical,
    similarityThreshold: 0,
});

export const jsonLexicalDiff = jsonLexicalDiffTool.run;
