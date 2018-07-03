import { dynamicProgrammingHCS } from '../hcs';

describe('dynamicProgrammingHCS', () => {
    it('should work as LCS with uniform weight', () => {
        const left = 'XMJYAUZ';
        const right = 'mzjawxu';

        const equal = (l: string, r: string) => l.toLowerCase() === r.toLowerCase();
        const weight = () => 1;
        const result = dynamicProgrammingHCS(equal, weight, left.split(''), right.split(''));

        expect(result).toMatchSnapshot();
        expect(result.leftHCS.join('')).toBe('MJAU');
    });

    it('should work with variable weight', () => {
        const left = 'XMJYAUZ';
        const right = 'mzjawxu';

        const equal = (l: string, r: string) => l.toLowerCase() === r.toLowerCase();
        const weight = (i: string) => i === 'Z' ? 10 : 1;
        const result = dynamicProgrammingHCS(equal, weight, left.split(''), right.split(''));

        expect(result).toMatchSnapshot();
        expect(result.leftHCS.join('')).toBe('MZ');
    });
});
