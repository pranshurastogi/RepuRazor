const fs = require('fs');
const path = require('path');

function loadAllChallenges() {
  const filePath = path.join(__dirname, '../challenges/quiz.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Quiz challenge file not found.');
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadChallengesByCategory(category) {
  const all = loadAllChallenges();
  return all.filter(ch => ch.category.toLowerCase() === category.toLowerCase());
}

function loadChallenge(challengeId) {
  const all = loadAllChallenges();
  const challenge = all.find(ch => ch.id === challengeId);
  if (!challenge) {
    throw new Error(`Challenge with id ${challengeId} not found.`);
  }
  return challenge;
}

module.exports = {
  loadAllChallenges,
  loadChallengesByCategory,
  loadChallenge
};
