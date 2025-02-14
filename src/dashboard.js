const blessed = require('blessed');
const fs = require('fs');
const os = require('os');
const path = require('path');

const profilePath = path.join(os.homedir(), '.repurazor_profile.json');

function readScore() {
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      return profile.score || 0;
    } catch (err) {
      return 0;
    }
  }
  return 0;
}

function showDashboard() {
  // Create a blessed screen.
  const screen = blessed.screen({
    smartCSR: true,
    title: 'repurazor Dashboard'
  });

  // Create a box for displaying the score.
  const scoreBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '20%',
    content: 'Loading score...',
    tags: true,
    border: { type: 'line' },
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'blue' }
    }
  });

  screen.append(scoreBox);

  function updateScoreDisplay() {
    const score = readScore();
    scoreBox.setContent(`{bold}Your Current Score:{/bold} ${score}`);
    screen.render();
  }

  updateScoreDisplay();
  const interval = setInterval(updateScoreDisplay, 2000);

  // Allow exit.
  screen.key(['escape', 'q', 'C-c'], () => {
    clearInterval(interval);
    process.exit(0);
  });
}

module.exports = { showDashboard };
