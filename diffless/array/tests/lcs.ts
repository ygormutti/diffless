import { dynamicProgrammingLCS } from '../lcs';

describe('dynamicProgrammingLCS', () => {
    it('should find LCS, left offset and right offset', () => {
        const left = 'Longest common substring';
        const right = 'COMPARE WITH THIS COMMON STRING';

        const equal = (l: string, r: string) => l.toLowerCase() === r.toLowerCase();
        const result = dynamicProgrammingLCS(equal, left.split(''), right.split(''));

        expect(result.lcs.join('')).toBe(' common s');
        expect(result.leftOffset).toBe(7);
        expect(result.rightOffset).toBe(17);
    });
});
