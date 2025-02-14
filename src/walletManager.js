const { ethers } = require('ethers');

/**
 * Creates a new EVM wallet with a random mnemonic.
 */
function createNewWallet() {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
}

/**
 * Imports an existing EVM wallet using a seed phrase.
 */
function importWallet(seedPhrase) {
  try {
    const wallet = ethers.Wallet.fromMnemonic(seedPhrase);
    return wallet;
  } catch (err) {
    throw new Error('Invalid seed phrase. Please try again.');
  }
}

module.exports = { createNewWallet, importWallet };
