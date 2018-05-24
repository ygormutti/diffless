export const transform = {
    '^.+\\.tsx?$': 'ts-jest',
};

export const testRegex = '/tests/(?!test-).*\\.tsx?$';

export const moduleFileExtensions = [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
];

export const snapshotSerializers = [
    './jest-serializers/position',
    './jest-serializers/range',
    './jest-serializers/changes',
];
