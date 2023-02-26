export default {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['<rootDir>/src/tests/**'],
    preset: "ts-jest",
    testEnvironment: "node"
}
