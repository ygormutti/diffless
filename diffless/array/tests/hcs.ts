import { dynamicProgrammingHCS } from '../hcs';

describe('dynamicProgrammingHCS', () => {
    it('should work as LCS with uniform weight', () => {
        const left = 'XMJYAUZ';
        const right = 'MZJAWXU';

        const equal = (l: string, r: string) => l === r;
        const weight = () => 1;
        const hcs = dynamicProgrammingHCS(equal, weight, left.split(''), right.split(''));

        expect(hcs.join('')).toBe('MJAU');
    });

    it('should work with variable weight', () => {
        const left = 'XMJYAUZ';
        const right = 'MZJAWXU';

        const equal = (l: string, r: string) => l === r;
        const weight = (i: string) => i === 'Z' ? 10 : 1;
        const hcs = dynamicProgrammingHCS(equal, weight, left.split(''), right.split(''));

        expect(hcs.join('')).toBe('MZ');
    });
});
