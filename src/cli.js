const { Command } = require('commander');
const challengeManager = require('./challengeManager');
const zkCircuitUtils = require('./zkCircuitUtils');
const sponsorIntegration = require('./sponsorIntegration');
const deployment = require('./deployment');
const leaderboard = require('./leaderboard');

async function run() {
  // Dynamically import ES modules
  let inquirer, chalk;
  try {
    inquirer = (await import('inquirer')).default;
    chalk = (await import('chalk')).default;
  } catch (error) {
    console.error('Failed to import required modules:', error);
    process.exit(1);
  }

  // Create a new Commander program instance
  const program = new Command();
  program
    .version('1.0.0')
    .description('ZK Quest: Gamified CLI for Zero-Knowledge Proof Challenges');

  // Define commands (for non-interactive use)

  // Command: start challenge
  program
    .command('start <challengeId>')
    .description('Start a ZK challenge')
    .action((challengeId) => {
      try {
        const challenge = challengeManager.loadChallenge(challengeId);
        console.log(chalk.green(`\nChallenge: ${challenge.title}`));
        console.log(chalk.yellow(`Description: ${challenge.description}`));
      } catch (error) {
        console.error(chalk.red('Error starting challenge:'), error.message);
      }
    });

  // Command: build circuit
  program
    .command('build <circuitPath>')
    .description('Compile a ZK circuit (e.g., using Circom)')
    .action(async (circuitPath) => {
      try {
        console.log(chalk.blue(`Compiling circuit at: ${circuitPath}`));
        const result = await zkCircuitUtils.compileCircuit(circuitPath);
        console.log(chalk.green('Compilation Successful:'), result);
      } catch (err) {
        console.error(chalk.red('Compilation Error:'), err.message);
      }
    });

  // Command: verify challenge
  program
    .command('verify <challengeId> <inputFile>')
    .description('Generate and verify proof for a challenge')
    .action(async (challengeId, inputFile) => {
      try {
        console.log(chalk.blue(`Verifying challenge ${challengeId} using input file: ${inputFile}`));
        const challenge = challengeManager.loadChallenge(challengeId);
        const inputData = require(`../${inputFile}`);
        const circuit = await zkCircuitUtils.compileCircuit(challenge.circuitPath);
        const proof = await zkCircuitUtils.generateProof(circuit, inputData);
        const txReceipt = await zkCircuitUtils.submitProof(proof);
        console.log(chalk.green('Proof Submitted. Tx Hash:'), txReceipt.transactionHash);
        zkCircuitUtils.watchVerification(txReceipt.transactionHash, (status) => {
          if (status.verified) {
            console.log(chalk.green('Proof Verified!'));
            leaderboard.updateScore(challengeId, challenge.points);
          } else {
            console.log(chalk.red('Verification failed. Please try again.'));
          }
        });
      } catch (err) {
        console.error(chalk.red('Verification Error:'), err.message);
      }
    });

  // Command: deploy contract
  program
    .command('deploy <network>')
    .description('Deploy smart contract to specified network')
    .action(async (network) => {
      try {
        console.log(chalk.blue(`Deploying smart contract on network: ${network}`));
        const result = await deployment.deployContract(network);
        console.log(chalk.green('Contract Deployed! Address:'), result.address);
      } catch (err) {
        console.error(chalk.red('Deployment Error:'), err.message);
      }
    });

  // Command: sponsor updates
  program
    .command('sponsor')
    .description('Fetch sponsor updates and bonus challenges')
    .action(async () => {
      try {
        console.log(chalk.blue('Fetching sponsor updates...'));
        const updates = await sponsorIntegration.fetchSponsorUpdates();
        console.log(chalk.green('Sponsor Updates:'), updates);
      } catch (err) {
        console.error(chalk.red('Error fetching sponsor updates:'), err.message);
      }
    });

  // Interactive Mode:
  // If no subcommand is provided, enter interactive mode.
  if (process.argv.length <= 2) {
    console.log(chalk.cyan('\nWelcome to repurazor CLI!'));
    console.log(chalk.cyan('This tool helps you manage zero-knowledge proof challenges, compile circuits, verify proofs, deploy smart contracts, and check sponsor updates.\n'));

    // Present an interactive menu
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: [
          { name: 'Start a Challenge', value: 'start' },
          { name: 'Build a Circuit', value: 'build' },
          { name: 'Verify a Challenge', value: 'verify' },
          { name: 'Deploy a Smart Contract', value: 'deploy' },
          { name: 'Fetch Sponsor Updates', value: 'sponsor' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (answer.command) {
      case 'start': {
        const { challengeId } = await inquirer.prompt([
          { type: 'input', name: 'challengeId', message: 'Enter Challenge ID (e.g., challenge-01):' }
        ]);
        try {
          const challenge = challengeManager.loadChallenge(challengeId);
          console.log(chalk.green(`\nChallenge: ${challenge.title}`));
          console.log(chalk.yellow(`Description: ${challenge.description}\n`));
        } catch (error) {
          console.error(chalk.red('Error starting challenge:'), error.message);
        }
        break;
      }
      case 'build': {
        const { circuitPath } = await inquirer.prompt([
          { type: 'input', name: 'circuitPath', message: 'Enter path to circuit file (e.g., circuits/arithmetic.circom):' }
        ]);
        try {
          console.log(chalk.blue(`Compiling circuit at: ${circuitPath}`));
          const result = await zkCircuitUtils.compileCircuit(circuitPath);
          console.log(chalk.green('Compilation Successful:'), result);
        } catch (err) {
          console.error(chalk.red('Compilation Error:'), err.message);
        }
        break;
      }
      case 'verify': {
        const answers = await inquirer.prompt([
          { type: 'input', name: 'challengeId', message: 'Enter Challenge ID (e.g., challenge-01):' },
          { type: 'input', name: 'inputFile', message: 'Enter path to input file (e.g., data/sample.json):' }
        ]);
        try {
          console.log(chalk.blue(`Verifying challenge ${answers.challengeId} using input file: ${answers.inputFile}`));
          const challenge = challengeManager.loadChallenge(answers.challengeId);
          const inputData = require(`../${answers.inputFile}`);
          const circuit = await zkCircuitUtils.compileCircuit(challenge.circuitPath);
          const proof = await zkCircuitUtils.generateProof(circuit, inputData);
          const txReceipt = await zkCircuitUtils.submitProof(proof);
          console.log(chalk.green('Proof Submitted. Tx Hash:'), txReceipt.transactionHash);
          zkCircuitUtils.watchVerification(txReceipt.transactionHash, (status) => {
            if (status.verified) {
              console.log(chalk.green('Proof Verified!'));
              leaderboard.updateScore(answers.challengeId, challenge.points);
            } else {
              console.log(chalk.red('Verification failed. Please try again.'));
            }
          });
        } catch (err) {
          console.error(chalk.red('Verification Error:'), err.message);
        }
        break;
      }
      case 'deploy': {
        const { network } = await inquirer.prompt([
          { type: 'input', name: 'network', message: 'Enter network name (e.g., arbitrum):' }
        ]);
        try {
          console.log(chalk.blue(`Deploying smart contract on network: ${network}`));
          const result = await deployment.deployContract(network);
          console.log(chalk.green('Contract Deployed! Address:'), result.address);
        } catch (err) {
          console.error(chalk.red('Deployment Error:'), err.message);
        }
        break;
      }
      case 'sponsor': {
        try {
          console.log(chalk.blue('Fetching sponsor updates...'));
          const updates = await sponsorIntegration.fetchSponsorUpdates();
          console.log(chalk.green('Sponsor Updates:'), updates);
        } catch (err) {
          console.error(chalk.red('Error fetching sponsor updates:'), err.message);
        }
        break;
      }
      case 'exit': {
        console.log(chalk.cyan('Goodbye!'));
        process.exit(0);
      }
      default:
        console.log(chalk.red('Unknown command.'));
    }
  } else {
    // If arguments were provided, let Commander handle them.
    program.parse(process.argv);
  }
}

module.exports = { run };

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
