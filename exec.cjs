#!/usr/bin/env node
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const { execSync } = require("child_process");

const tsxPath = path.join(__dirname, "./node_modules/.bin/tsx");
const indexTsPath = path.join(__dirname, "./src/index.ts");
try {
  execSync(`${tsxPath} ${indexTsPath}`, { stdio: "inherit" });
} catch (e) {
  // Gracefully exit if needed
  process.exit(1);
}
