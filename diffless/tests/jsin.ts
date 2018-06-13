import { BaseJSIN, DEFAULT_META_KEY } from '../jsin';

const JSIN = new BaseJSIN();

@JSIN.enabled
class Mock {
    constructor(readonly data: {
        readonly str?: string,
        readonly num?: number,
        readonly bool?: boolean,
        readonly arr?: any[],
        readonly obj?: any,
    } = {}) { }

    doesItWork() {
        return true;
    }
}

describe('JSIN', () => {
    it(' enabled should decorate constructor with key', () => {
        const ctor = Mock as any;
        expect(ctor[DEFAULT_META_KEY]).toBe('Mock_0');
    });

    it('stringify should add metadata to instances of serializable constructors', () => {
        const obj = new Mock({
            arr: [new Mock({ obj: null }), true],
            obj: new Mock({ str: 'myString', bool: true }),
        });
        expect(JSIN.stringify(obj, undefined, 4)).toMatchSnapshot();
    });

    it('parse should set prototypes correctly', () => {
        const obj = new Mock();
        const str = JSIN.stringify(obj);

        const parsedObj = JSIN.parse(str);

        expect(parsedObj.doesItWork()).toBe(true);
    });
});
