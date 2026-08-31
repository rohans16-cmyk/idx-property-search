/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/properties.routes.test.js"],
  collectCoverageFrom: ["routes/properties.js"],
  coverageThreshold: {
    "routes/properties.js": {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
