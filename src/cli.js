// src/cli.js
const { Command } = require('commander');
const challengeManager = require('./challengeManager');
const zkCircuitUtils = require('./zkCircuitUtils');
const sponsorIntegration = require('./sponsorIntegration');
const deployment = require('./deployment');
const leaderboard = require('./leaderboard');
const walletManager = require('./walletManager');
const logger = require('./logger');
const { runAIDAppDemo } = require('./aiDapp');
const { showDashboard } = require('./dashboard');
const fs = require('fs');
const os = require('os');
const path = require('path');

let userProfile = { nickname: '', score: 0 };
const profilePath = path.join(os.homedir(), '.repurazor_profile.json');
const usersFile = path.join(os.homedir(), '.repurazor_users.json');

function saveProfile() {
  fs.writeFileSync(profilePath, JSON.stringify(userProfile, null, 2));
}

async function loadProfile() {
  if (fs.existsSync(profilePath)) {
    try {
      userProfile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    } catch (e) {
      userProfile = { nickname: '', score: 0 };
    }
  }
}

function loadUsers() {
  if (fs.existsSync(usersFile)) {
    try {
      return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

async function getUniqueNickname(promptMessage) {
  const inquirer = (await import('inquirer')).default;
  let users = loadUsers();
  while (true) {
    const { nickname } = await inquirer.prompt([
      { type: 'input', name: 'nickname', message: promptMessage }
    ]);
    if (users.includes(nickname)) {
      console.log('Nickname already taken. Please choose a different one.');
    } else {
      users.push(nickname);
      saveUsers(users);
      return nickname;
    }
  }
}

// Interactive Quiz mode with timer, random non-repeating questions, and difficulty progression.
async function interactiveQuiz() {
  const inquirer = (await import('inquirer')).default;
  const chalk = (await import('chalk')).default;
  
  // Prompt for category.
  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Select quiz category:',
      choices: [
        { name: 'ZK', value: 'zk' },
        { name: 'Educhain', value: 'educhain' },
        { name: 'Arbitrium', value: 'arbitrium' },
        { name: 'zkverify', value: 'zkverify' },
        { name: 'Cryptography', value: 'cryptography' }
      ]
    }
  ]);
  
  const allQuestions = challengeManager.loadChallengesByCategory(category);
  if (!allQuestions.length) {
    console.log(chalk.yellow('No quiz questions available for this category.'));
    return;
  }
  
  // Group questions by difficulty.
  let simpleQs = allQuestions.filter(q => q.difficulty.toLowerCase() === 'simple');
  let moderateQs = allQuestions.filter(q => q.difficulty.toLowerCase() === 'moderate');
  let hardQs = allQuestions.filter(q => q.difficulty.toLowerCase() === 'hard');
  
  function getRandomQuestion(questions) {
    if (questions.length === 0) return null;
    const idx = Math.floor(Math.random() * questions.length);
    const question = questions[idx];
    questions.splice(idx, 1);
    return question;
  }
  
  console.log(chalk.cyan(`\nStarting Quiz Challenge in ${category.toUpperCase()}! You have 1 minute.`));
  const quizDuration = 60 * 1000; // 1 minute in milliseconds.
  const startTime = Date.now();
  let currentPool = [...simpleQs]; // Start with simple questions.
  
  while (Date.now() - startTime < quizDuration) {
    const timeLeft = Math.ceil((quizDuration - (Date.now() - startTime)) / 1000);
    if (currentPool.length === 0) {
      if (simpleQs.length === 0 && moderateQs.length > 0) {
        currentPool = [...moderateQs];
      } else if (moderateQs.length === 0 && hardQs.length > 0) {
        currentPool = [...hardQs];
      } else {
        console.log(chalk.yellow('No more questions available.'));
        break;
      }
    }
    const question = getRandomQuestion(currentPool);
    if (!question) break;
    
    const promptMsg = `${question.question} (Time left: ${timeLeft} sec)`;
    const { answer } = await inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: promptMsg,
        choices: question.options
      }
    ]);
    
    // Check if time is up.
    if (Date.now() - startTime >= quizDuration) break;
    
    if (answer === question.correctAnswer) {
      let points = 0;
      switch (question.difficulty.toLowerCase()) {
        case 'simple': points = 2; break;
        case 'moderate': points = 3; break;
        case 'hard': points = 10; break;
        default: points = 2;
      }
      userProfile.score += points;
      saveProfile();
      console.log(chalk.green(`Correct! +${points} points. Current Score: ${userProfile.score}\n`));
    } else {
      userProfile.score -= 1;
      saveProfile();
      console.log(chalk.red(`Wrong! -1 point. Correct answer: ${question.correctAnswer}`));
      console.log(chalk.red(`Current Score: ${userProfile.score}\n`));
      const { retry } = await inquirer.prompt([
        {
          type: 'list',
          name: 'retry',
          message: 'Do you want to retry this question?',
          choices: [
            { name: 'Retry', value: 'retry' },
            { name: 'Quit Quiz', value: 'quit' }
          ]
        }
      ]);
      if (retry === 'retry') {
        // Put the question back into the pool.
        currentPool.unshift(question);
      } else {
        break;
      }
    }
  }
  console.log(chalk.cyan('\nQuiz session ended.'));
  console.log(chalk.green(`Final Score: ${userProfile.score}\n`));
}

async function playChainChallenge() {
  // Dummy implementation for the chain challenge mini-game.
  const inquirer = (await import('inquirer')).default;
  const chalk = (await import('chalk')).default;
  console.log(chalk.cyan('\nStarting Chain Challenge!'));
  const puzzle = {
    question: 'Quick puzzle: What is the hash of "zk"?',
    options: ['0xabc', '0x123', '0xdef', '0x456'],
    correctAnswer: '0xdef',
    difficulty: 'moderate'
  };
  const { answer } = await inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: puzzle.question,
      choices: puzzle.options
    }
  ]);
  if (answer === puzzle.correctAnswer) {
    userProfile.score += 3;
    saveProfile();
    console.log(chalk.green('Correct! Simulating on-chain tx submission...'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(chalk.green(`Tx simulated! Current Score: ${userProfile.score}\n`));
  } else {
    userProfile.score -= 1;
    saveProfile();
    console.log(chalk.red(`Wrong! -1 point. Current Score: ${userProfile.score}\n`));
  }
}

async function playAIDAppDemo() {
  const inquirer = (await import('inquirer')).default;
  const chalk = (await import('chalk')).default;
  console.log(chalk.cyan('\nStarting AI-integrated EDU Chain dApp Demo...'));
  
  // Step 1: Connect to EDU Chain network.
  console.log(chalk.blue('Deploying smart contract on EDU Chain...'));
  let eduContract;
  try {
    eduContract = await deployment.deployContract("eduChain");
    console.log(chalk.green(`Smart contract deployed on EDU Chain at address: ${eduContract.address}`));
  } catch (error) {
    console.error(chalk.red('Error deploying contract on EDU Chain:'), error.message);
    return;
  }
  
  // Step 2: Simulate AI processing using AIML API.
  const { aiInput } = await inquirer.prompt([
    { type: 'input', name: 'aiInput', message: 'Enter text for AI processing:' }
  ]);
  console.log(chalk.blue('Processing AI input...'));
  
  // Use the OpenAI SDK for AIML API (see src/aiDapp.js for details).
  const { OpenAI } = require("openai");
  const baseURL = "https://api.aimlapi.com/v1";
  const apiKey = process.env.AIML_API_KEY || "my_key";
  const systemPrompt = "You are an intelligent assistant for EDU Chain dApps.";
  const userPrompt = `Process the following input for insights: ${aiInput}`;
  const api = new OpenAI({ apiKey, baseURL });
  
  try {
    const completion = await api.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 256,
    });
    const aiResponse = completion.choices[0].message.content;
    console.log(chalk.green("AI Response:"), aiResponse);
  } catch (error) {
    console.error(chalk.red("AI processing error:"), error.message);
    return;
  }
  
  // Step 3: Generate dummy Groth16 proof.
  console.log(chalk.blue("Generating Groth16 proof..."));
  
  
  // Step 4: Submit dummy proof.
  console.log(chalk.blue("Submitting proof via zkVerify..."));
  
}

async function run() {
  let inquirer, chalk;
  try {
    inquirer = (await import('inquirer')).default;
    chalk = (await import('chalk')).default;
  } catch (error) {
    console.error('Failed to import required modules:', error);
    process.exit(1);
  }

  await loadProfile();
  logger.info('Starting repurazor CLI with gamified AI & challenge features...');

  // Wallet initialization
  let wallet;
  const walletAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'Do you want to create a new wallet or import an existing wallet?',
      choices: [
        { name: 'Create New Wallet', value: 'create' },
        { name: 'Import Existing Wallet', value: 'import' }
      ]
    }
  ]);
  
  if (walletAnswer.walletChoice === 'create') {
    wallet = walletManager.createNewWallet();
    logger.info(`New wallet created with address: ${wallet.address}`);
    console.log(chalk.green(`New wallet created! Address: ${wallet.address}`));
    console.log(chalk.yellow(`Seed Phrase: ${wallet.mnemonic.phrase}`));
    console.log(chalk.yellow('Please store your seed phrase securely!'));
    userProfile.nickname = await getUniqueNickname('Enter a new nickname:');
    userProfile.score = 0;
    saveProfile();
    logger.info(`New profile created for ${userProfile.nickname} with score ${userProfile.score}`);
    console.log(chalk.green(`Hello, ${userProfile.nickname}! Your current score is ${userProfile.score}.`));
  } else {
    const importAnswer = await inquirer.prompt([
      { type: 'input', name: 'seedPhrase', message: 'Enter your wallet seed phrase:' }
    ]);
    try {
      wallet = walletManager.importWallet(importAnswer.seedPhrase);
      logger.info(`Wallet imported with address: ${wallet.address}`);
      console.log(chalk.green(`Wallet imported successfully! Address: ${wallet.address}`));
      if (!userProfile.nickname) {
        userProfile.nickname = await getUniqueNickname('Enter your nickname:');
        saveProfile();
      } else {
        const { update } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'update',
            message: 'Would you like to update your nickname?',
            default: false
          }
        ]);
        if (update) {
          userProfile.nickname = await getUniqueNickname('Enter a new unique nickname:');
          saveProfile();
        }
      }
      console.log(chalk.green(`Hello, ${userProfile.nickname}! Your current score is ${userProfile.score}.`));
    } catch (error) {
      logger.error(`Wallet import failed: ${error.message}`);
      console.error(chalk.red('Wallet import failed:'), error.message);
      process.exit(1);
    }
  }

  // Main interactive menu.
  while (true) {
    const { mainOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainOption',
        message: 'What would you like to do?',
        choices: [
          { name: 'Take a Quiz Challenge (Proof Race)', value: 'quiz' },
          { name: 'Play Chain Challenge', value: 'chain' },
          { name: 'Run AI-dApp Demo', value: 'ai-dapp' },
          { name: 'Take a Proof Challenge', value: 'proof' },
          { name: 'View Profile', value: 'profile' },
          { name: 'Launch Dashboard', value: 'dashboard' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (mainOption === 'exit') {
      console.log(chalk.cyan('Goodbye!'));
      process.exit(0);
    } else if (mainOption === 'profile') {
      console.log(chalk.green(`Nickname: ${userProfile.nickname}`));
      console.log(chalk.green(`Score: ${userProfile.score}`));
    } else if (mainOption === 'dashboard') {
      console.log(chalk.cyan('Launching dashboard. Open a new terminal and run "node src/dashboard.js" for a persistent view.'));
      showDashboard();
    } else if (mainOption === 'quiz') {
      await interactiveQuiz();
    } else if (mainOption === 'chain') {
      await playChainChallenge();
    } else if (mainOption === 'ai-dapp') {
      await playAIDAppDemo();
    } else if (mainOption === 'proof') {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'challengeId', message: 'Enter Proof Challenge ID (e.g., challenge-01):' },
        { type: 'input', name: 'inputFile', message: 'Enter path to input file (e.g., data/sample.json):' }
      ]);
      console.log(chalk.magenta('Hint: Ensure your input file contains valid JSON with required parameters.'));
      try {
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
            userProfile.score += challenge.points;
            saveProfile();
            console.log(chalk.green(`Your updated score: ${userProfile.score}`));
          } else {
            console.log(chalk.red('Verification failed. Please try again.'));
          }
        });
      } catch (err) {
        console.error(chalk.red('Verification Error:'), err.message);
      }
    }
  }
}

module.exports = { run };

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
