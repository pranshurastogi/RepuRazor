const fs = require('fs');
const path = require('path');
const leaderboardFile = path.join(__dirname, '../leaderboard.json');

function updateScore(challengeId, points) {
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(fs.readFileSync(leaderboardFile, 'utf8'));
  } catch (err) {
    leaderboard = [];
  }
  // Here we simply update a score per challenge.
  let entry = leaderboard.find(e => e.challengeId === challengeId);
  if (!entry) {
    entry = { challengeId, score: 0 };
    leaderboard.push(entry);
  }
  entry.score += points;
  fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
  console.log('Leaderboard updated:', leaderboard);
}

module.exports = { updateScore };
