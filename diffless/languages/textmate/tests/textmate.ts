import { tokenize, vsctmRegistry } from '..';
import { fixtureDocument } from '../../../tests/test-util';

describe('languages/textmate', () => {
    describe('JSON lexer return', () => {
        it('JSON tokenizer should match snapshot', async () => {
            const scopeName = 'source.json.comments';
            const grammar = await vsctmRegistry.loadGrammar(scopeName);
            const document = fixtureDocument('mostly_formatting/after.json');

            tokenize(scopeName, grammar, document);
            expect(tokenize(scopeName, grammar, document)).toMatchSnapshot();
        });
    });
});
