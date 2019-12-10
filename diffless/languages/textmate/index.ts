import { readFile } from 'fs';
import { OnigScanner, OnigString } from 'oniguruma';
import { basename, join } from 'path';
import {
    IGrammar,
    INITIAL,
    IOnigLib,
    IRawGrammar,
    OnigScanner as VsctmOnigScanner,
    parseRawGrammar,
    Registry,
    Thenable,
} from 'vscode-textmate';
import { characterDiff, combine, DiffToolRegistry } from '../..';
import { HCSDiffTool } from '../../hcsdiff/diff';
import { Token, ValuedToken } from '../../hcsdiff/model';
import { DiffLevel, DiffToolFactory, Document, Location, Position, Range } from '../../model';

interface TokenMetadata {
    ignored: string[];
    valued: string[];
}

interface GrammarMetadata {
    id: string;
    path: string;
    scopeName: string;
    tokens: TokenMetadata;

    extensions: string[];
    filenames: string[];
    mimetypes: string[];
}

function loadGrammarsMetadata(): { [scopeName: string]: GrammarMetadata } {
    return {
        'source.json.comments': {
            extensions: [ // languages[].extensions
                '.json',
                '.bowerrc',
                '.jshintrc',
                '.jscsrc',
                '.swcrc',
                '.webmanifest',
                '.js.map',
                '.css.map',
            ],
            filenames: [ // languages[].filenames
                'composer.lock',
                '.watchmanconfig',
                '.ember-cli',
            ],
            id: 'json', // languages[].id
            mimetypes: [ // languages[].mimetypes
                'application/json',
                'application/manifest+json',
            ],
            path: './syntaxes/JSONC.tmLanguage.json', // languages[].grammars[].path
            scopeName: 'source.json.comments', // languages[].grammars[].scopeName
            tokens: {
                ignored: [
                    'source.json.comments',
                    'meta.structure.dictionary.json.comments',
                    'meta.structure.dictionary.value.json.comments',
                    'meta.structure.array.json.comments',
                ],
                valued: [
                    'support.type.property-name.json.comments',
                    'string.quoted.double.json.comments',
                    'constant.numeric.json.comments',
                    'constant.language.json.comments',
                ],
            },
        },
        'source.lua': {
            extensions: ['.lua'],
            filenames: [],
            id: 'lua', // languages[].id
            mimetypes: [],
            path: './syntaxes/lua.tmLanguage.json',
            scopeName: 'source.lua',
            tokens: {
                ignored: [],
                valued: [],
            },
        },
    };
}

let grammarsMetadataCache: { [scopeName: string]: GrammarMetadata };
function getGrammarsMetadata(): { [scopeName: string]: GrammarMetadata } {
    if (grammarsMetadataCache) {
        return grammarsMetadataCache;
    }
    grammarsMetadataCache = loadGrammarsMetadata();
    return grammarsMetadataCache;
}

function getOniguruma(): Thenable<IOnigLib> {
    return Promise.resolve({
        createOnigScanner(patterns: string[]) {
            return new OnigScanner(patterns) as unknown as VsctmOnigScanner;
        },
        createOnigString(s: string) {
            const str = new OnigString(s);
            (str as any).content = s;
            return str;
        },
    });
}

export const vsctmRegistry = new Registry({
    getOnigLib: getOniguruma,
    loadGrammar: (scopeName: string): Thenable<IRawGrammar | undefined | null> => {
        const grammarMetadata = getGrammarsMetadata()[scopeName];
        if (grammarMetadata) {
            const path = join(__dirname, 'grammars', grammarMetadata.id, basename(grammarMetadata.path));
            return new Promise((resolve, reject) => {
                readFile(path, (error, content) => {
                    if (error) {
                        reject(error);
                    } else {
                        const rawGrammar = parseRawGrammar(content.toString(), path);
                        resolve(rawGrammar);
                    }
                });
            });
        }
        return Promise.resolve(null);
    },
});

function parseTokenValue(content: string): any {
    try {
        return JSON.parse(content);
    } catch (err) {
        return content;
    }
}

export function tokenize(scopeName: string, grammar: IGrammar, document: Document): Token[] {
    const tokenMetadata = getGrammarsMetadata()[scopeName].tokens;
    const tokens: Token[] = [];

    let ruleStack = INITIAL;
    for (const line of document.lines) {
        const lineTokens = grammar.tokenizeLine(line.content, ruleStack);
        const lineNumber = line.start.line;
        for (const token of lineTokens.tokens) {
            const type = token.scopes[token.scopes.length - 1];
            if (tokenMetadata.ignored.includes(type)) continue;

            const start = new Position(lineNumber, token.startIndex + 1);
            const end = new Position(lineNumber, token.endIndex + 1);
            const location = new Location(document.uri, new Range(start, end));
            const content = line.content.substring(token.startIndex, token.endIndex);

            let modelToken: Token;
            if (tokenMetadata.valued.includes(type)) {
                modelToken = new ValuedToken(
                    location, content, type, parseTokenValue(content), (a, b) => a === b);
            } else {
                modelToken = new Token(location, content, type);
            }
            tokens.push(modelToken);
            console.log(modelToken.code);
        }
        ruleStack = lineTokens.ruleStack;
    }
    return tokens;
}

async function buildDiffToolFactory(scopeName: string): Promise<DiffToolFactory> {
    const grammar = await vsctmRegistry.loadGrammar(scopeName);

    const textmateLexicalDiffTool = new HCSDiffTool({
        equals: Token.equals,
        level: DiffLevel.Lexical,
        similarityThreshold: 0,
        toAtomArray: document => tokenize(scopeName, grammar, document),
    });

    return (_: any) => combine(characterDiff, textmateLexicalDiffTool.compare);
}

export async function registerDiffTools(diffToolRegistry: DiffToolRegistry) {
    const grammarsMetadata = getGrammarsMetadata();
    for (const scopeName of Object.keys(grammarsMetadata)) {
        const grammarMetadata = grammarsMetadata[scopeName];
        for (const extension of grammarMetadata.extensions) {
            diffToolRegistry.registerExtension(extension, await buildDiffToolFactory(scopeName));
        }
    }
}
