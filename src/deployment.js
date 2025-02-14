require('dotenv').config();
const hre = require("hardhat"); // Hardhat Runtime Environment
const { ethers } = hre;
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function deployContract(network) {
  let rpcUrl;
  let privateKey;

  if (network === 'eduChain') {
    // For EDU Chain, use environment variables from .env
    rpcUrl = process.env.OPEN_CODEX_URL;
    privateKey = process.env.PRI_KEY;
    if (!rpcUrl || !privateKey) {
      throw new Error('Missing EDU Chain configuration in .env file.');
    }
    logger.info(`Deploying on EDU Chain using RPC URL: ${rpcUrl}`);
  } else {
    // For other networks, load configuration from file.
    const configPath = path.join(__dirname, '../config/zkquest.config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at ${configPath}`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config[network]) {
      throw new Error(`Network configuration for "${network}" not found.`);
    }
    rpcUrl = config[network].rpcUrl;
    privateKey = config[network].privateKey;
    logger.info(`Deploying on ${network} using RPC URL: ${rpcUrl}`);
  }

  // Compile contracts via Hardhat.
  logger.info("Compiling contracts via Hardhat...");
  await hre.run("compile");

  // Use dynamic import for Inquirer (ES Module)
  const inquirerModule = await import('inquirer');
  const inquirer = inquirerModule.default;

  // Prompt the user to select the contract to deploy.
  const contractChoices = [
    { name: "HelloWorld", value: "HelloWorld" },
    { name: "GetSet", value: "GetSet" },
    { name: "ERC20", value: "ERC20" },
    { name: "NFT", value: "NFT" }
  ];
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "contractName",
      message: "Select the contract you want to deploy:",
      choices: contractChoices
    }
  ]);
  const contractName = answers.contractName;
  logger.info(`User selected contract: ${contractName}`);

  // Create provider and wallet using ethers v6 style.
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  logger.info(`Wallet loaded with address: ${wallet.address}`);

  // Get the contract factory for the chosen contract.
  const factory = await ethers.getContractFactory(contractName);
  logger.info(`Deploying ${contractName} contract...`);
  let contract;
  if (contractName === "HelloWorld") {
    // For HelloWorld, pass a constructor parameter.
    contract = await factory.deploy();
  } else {
    contract = await factory.deploy();
  }
  logger.info('Waiting for contract deployment...');
  await contract.waitForDeployment();
  // Use getAddress() to obtain the deployed contract address.
  const deployedAddress = await contract.getAddress();
  logger.info(`Contract deployed at address: ${deployedAddress}`);
  console.log(`Smart contract deployed on EDU Chain at address: ${deployedAddress}`);

  // Ensure the build directory exists.
  const buildDir = path.join(__dirname, '../build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
    logger.info(`Created build directory at ${buildDir}`);
  }

  // Save the deployed contract's artifact (ABI and bytecode) to build/Contract.json.
  const artifact = await hre.artifacts.readArtifact(contractName);
  const artifactPath = path.join(buildDir, 'Contract.json');
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  logger.info(`Contract artifact saved at ${artifactPath}`);

  return contract;
}

module.exports = { deployContract };


