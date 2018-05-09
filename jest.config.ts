export const transform = {
    '^.+\\.tsx?$': 'ts-jest',
};

export const testRegex = '(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$';

export const moduleFileExtensions = [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
];

export const snapshotSerializers = [
    './jest-changes-serializer',
];
