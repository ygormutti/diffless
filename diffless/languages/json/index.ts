import { characterDiff, combine } from '../..';
import { HCSDiffTool } from '../../hcsdiff/diff';
import { Token } from '../../hcsdiff/model';
import { DiffLevel } from '../../model';
import { tokenize } from './lexer';

const jsonLexicalDiffTool = new HCSDiffTool({
    equals: Token.equals,
    level: DiffLevel.Lexical,
    similarityThreshold: 0,
    toAtomArray: tokenize,
});

export const jsonLexicalDiff = jsonLexicalDiffTool.compare;

export const jsonDiff = combine(characterDiff, jsonLexicalDiff);
