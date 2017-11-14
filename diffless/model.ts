namespace diffless.model {

    class Position {
        constructor(
            readonly line: number,
            readonly column: number,
        ) { }
    }

    class Token {
        constructor(
            readonly type: number,
            readonly raw: string,
            readonly position: Position,
        ) { }
    }

}