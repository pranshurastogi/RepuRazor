#!/usr/bin/env node
const cli = require('../src/cli');

// Call the async run() function and catch any errors
cli.run().catch((err) => {
  console.error(err);
  process.exit(1);
});
