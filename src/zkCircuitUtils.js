const { exec } = require('child_process');
const zkverifyjs = require('zkverifyjs'); // Ensure you install the package with a lowercase name

/**
 * Compiles a ZK circuit using circom.
 * @param {string} circuitPath - The file path to the circuit.
 * @returns {Promise<string>} - Resolves with the compiler output (stdout).
 */
function compileCircuit(circuitPath) {
  return new Promise((resolve, reject) => {
    exec(`circom ${circuitPath} --r1cs --wasm --sym`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error compiling circuit at ${circuitPath}: ${stderr}`);
        return reject(new Error(`Compilation failed: ${stderr}`));
      }
      console.log(`Compilation output for ${circuitPath}: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Generates a proof from the compiled circuit and input data.
 * (This is a placeholder – replace with actual logic using zkverifyjs or other proof generators.)
 * @param {any} circuit - The compiled circuit data.
 * @param {any} inputData - The input data for the circuit.
 * @returns {Promise<Object>} - Resolves with an object containing proof and public signals.
 */
async function generateProof(circuit, inputData) {
  try {
    // Replace this with actual proof generation logic.
    // For example, you might call: 
    // const result = await zkverifyjs.generateProof({ circuit, inputData });
    const proofResult = {
      proof: 'sample_proof_data',
      publicSignals: [] // Replace with actual public signals.
    };
    console.log('Proof generated successfully:', proofResult);
    return proofResult;
  } catch (error) {
    console.error('Error generating proof:', error);
    throw new Error(`Proof generation error: ${error.message}`);
  }
}

/**
 * Submits a proof using zkverifyjs.
 * @param {Object} proof - The proof object to submit.
 * @returns {Promise<Object>} - Resolves with the transaction receipt.
 */
async function submitProof(proof) {
  try {
    const txReceipt = await zkverifyjs.submitProof(proof);
    console.log('Proof submitted. Transaction receipt:', txReceipt);
    return txReceipt;
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw new Error(`Proof submission error: ${error.message}`);
  }
}

/**
 * Watches the verification process for a given transaction hash.
 * @param {string} txHash - The transaction hash to monitor.
 * @param {Function} callback - A callback function to handle status updates.
 */
function watchVerification(txHash, callback) {
  try {
    zkverifyjs.watchVerification(txHash, (status) => {
      console.log(`Verification status for txHash ${txHash}:`, status);
      if (typeof callback === 'function') {
        callback(status);
      }
    });
  } catch (error) {
    console.error(`Error watching verification for txHash ${txHash}:`, error);
    throw new Error(`Watch verification error: ${error.message}`);
  }
}

module.exports = {
  compileCircuit,
  generateProof,
  submitProof,
  watchVerification
};
