const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployContract(network) {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/zkquest.config.json')));
  const provider = new ethers.providers.JsonRpcProvider(config[network].rpcUrl);
  const wallet = new ethers.Wallet(config[network].privateKey, provider);

  // Load compiled contract JSON (ABI and bytecode)
  const contractArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/Contract.json')));
  const factory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();
  return contract;
}

module.exports = { deployContract };
