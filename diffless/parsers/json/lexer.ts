enum TokenTypes {
    LeftBrace,
    RightBrace,
    Semicolon,
    Comma,
    LeftBracket,
    RightBracket,
    String,
    Number,
    True,
    False,
    Null
}

function lex(source: string) {
    for (let token of tokenizer(source)) {
        switch (token.type) {
            case tokenizer.TokenType.Punctuation:
                switch (token.raw) {
                    case '{':

                        break;
                
                    default:
                        break;
                }
                break;
        
            default:
                break;
        }
    }
}