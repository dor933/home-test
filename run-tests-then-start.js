#!/usr/bin/env node

const { execSync } = require("child_process");

console.log("\nStarting test environment...");
console.log("================================\n");

try {
  // Run tests
  execSync(
    "docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from server-test",
    { stdio: "inherit" }
  );

  console.log("\nCleaning up test environment...");
  execSync("docker-compose -f docker-compose.test.yml down -v", {
    stdio: "inherit",
  });

  console.log("\nTests passed! Starting production containers");
  console.log("==================================================\n");

  execSync("docker-compose up --build -d", { stdio: "inherit" });

  console.log("\nProduction containers are running");
} catch (error) {
  console.log("\nCleaning up test environment...");
  try {
    execSync("docker-compose -f docker-compose.test.yml down -v", {
      stdio: "inherit",
    });
  } catch (cleanupError) {
    // Ignore cleanup errors
  }

  console.error("\nTests failed! Production containers will NOT start.");
  console.error("Fix the tests and try again.\n");
  process.exit(1);
}
