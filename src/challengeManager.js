const fs = require('fs');
const path = require('path');

function loadChallenge(challengeId) {
  const filePath = path.join(__dirname, '../challenges', `${challengeId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Challenge ${challengeId} not found.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { loadChallenge };
