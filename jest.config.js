/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/build/', '/archive/'],
    moduleNameMapper: {
        'src/(.*)': '<rootDir>/src/$1',
    },
    resolver: 'jest-ts-webcompat-resolver',
    setupFilesAfterEnv: ['./tests/setup-tests.ts'],
    // Don't care about coverage (for now)
    collectCoverage: false,
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
    ],
    coveragePathIgnorePatterns: [
        'src/index.ts',
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
};

// eslint-disable-next-line no-undef
module.exports = config;
