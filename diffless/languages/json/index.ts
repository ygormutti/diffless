import { characterDiff, compose } from '../..';
import { ArrayDiffTool } from '../../array/diff';
import { Token } from '../../array/model';
import { DiffLevel } from '../../model';
import { tokenize } from './lexer';

const jsonLexicalDiffTool = new ArrayDiffTool({
    equals: Token.equals,
    level: DiffLevel.Lexical,
    similarityThreshold: 0,
    toAtomArray: tokenize,
});

export const jsonLexicalDiff = jsonLexicalDiffTool.compare;

export const jsonDiff = compose(characterDiff, jsonLexicalDiff);
