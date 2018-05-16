/**
 * Allows Scala-like stripMargin
 *
 * Parameters are applied implicitly via ES2015.
 *
 * @example
 * // returns "The Number is:\n    100\nThanks for playing!"
 * let num = 100
 * let result = stripMargin`The Number is:
 *         |    ${num}
 *         |Thanks for playing!`
 * get the gist: https://gist.github.com/jimschubert/06fea56a6d2a1e7fdbc2
 */
export function stripMargin(template: TemplateStringsArray, ...expressions: any[]) {
    const result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });

    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}
