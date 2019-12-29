var config = require('./jest.config');
config.testMatch = ["**/*.int.test.ts"];
config.coverageDirectory = "";
config.collectCoverage = false;
console.log('RUNNING INTEGRATION TESTS ....');
module.exports = config;
