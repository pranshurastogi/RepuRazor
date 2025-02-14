// src/zkCircuitUtils.js
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const zkverifyjs = require("zkverifyjs"); // Production-grade zkVerifyJS library

/**
 * Compiles a ZK circuit using circom.
 * @param {string} circuitPath - The file path to the circuit.
 * @returns {Promise<string>} - Resolves with the compiler output.
 */
async function compileCircuit(circuitPath) {
  try {
    const { stdout, stderr } = await execAsync(`circom ${circuitPath} --r1cs --wasm --sym`);
    if (stderr) {
      console.error(`Compilation stderr: ${stderr}`);
    }
    console.log(`Compilation output for ${circuitPath}: ${stdout}`);
    return stdout;
  } catch (error) {
    console.error(`Error compiling circuit at ${circuitPath}:`, error);
    throw new Error(`Compilation failed: ${error.message}`);
  }
}

/**
 * Generates a Groth16 proof using zkVerifyJS.
 * @param {any} circuit - The compiled circuit output.
 * @param {any} inputData - The input data for the circuit.
 * @returns {Promise<Object>} - Resolves with an object containing the proof and public signals.
 */
async function generateProof(circuit, inputData) {
  try {
    // Call the production-grade proof generation function.
    // Adjust the parameter structure according to the actual zkVerifyJS API.
    const proofResult = await zkverifyjs.generateProof({
      circuit: circuit,
      inputData: inputData,
      proofType: "groth16",
      verifier: { library: zkverifyjs.Library.snarkjs, curve: zkverifyjs.CurveType.bn128 }
    });
    console.log("Proof generated successfully:", proofResult);
    return proofResult;
  } catch (error) {
    console.error("Error generating proof:", error);
    throw new Error(`Proof generation error: ${error.message}`);
  }
}

/**
 * Submits a proof using zkVerifyJS.
 * @param {Object} proof - The proof object to submit.
 * @returns {Promise<Object>} - Resolves with the transaction receipt.
 */
async function submitProof(proof) {
  try {
    const txReceipt = await zkverifyjs.submitProof(proof);
    console.log("Proof submitted. Transaction receipt:", txReceipt);
    return txReceipt;
  } catch (error) {
    console.error("Error submitting proof:", error);
    throw new Error(`Proof submission error: ${error.message}`);
  }
}

/**
 * Watches the verification process for a given transaction hash.
 * @param {string} txHash - The transaction hash to monitor.
 * @param {Function} callback - A callback function to handle status updates.
 * @returns {Promise<void>}
 */
async function watchVerification(txHash, callback) {
  try {
    await zkverifyjs.watchVerification(txHash, callback);
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
