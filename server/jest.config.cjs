module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/dist"],
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {},
  collectCoverageFrom: [
    "dist/**/*.js",
    "!dist/index.js",
    "!dist/tests/**/*.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
