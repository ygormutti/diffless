import { intEnumKeys } from '../util';

enum IntEnum {
    Zero,
    One,
    Two,
}

describe('utils', () => {
    describe('intEnumKeys', () => {
        it('should get enum keys correctly', () => {
            expect(intEnumKeys(IntEnum)).toEqual(['Zero', 'One', 'Two']);
        });
    });
});
