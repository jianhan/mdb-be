module.exports = {
    "globals": {
        "__DEV__": true,
        'ts-jest': {
            diagnostics: {
                warnOnly: true
            }
        }
    },
    "verbose": true,
    "roots": [
        "<rootDir>/src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": [
        "**/*.test.ts"
    ],
    "setupFilesAfterEnv": ["./jest.setup"],
    "collectCoverageFrom": [
        "**/*.{js,jsx,ts}",
        "!**/node_modules/**",
        "!**/vendor/**"
    ],
    "coverageDirectory": "coverage",
    "collectCoverage": true
}