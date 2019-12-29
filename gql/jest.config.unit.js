var config = require('./jest.config');
config.testMatch = ["**/*.unit.test.ts"];
config.coverageDirectory = "";
config.collectCoverage = false;
console.log('RUNNING UNIT TESTS ....');
module.exports = config;
