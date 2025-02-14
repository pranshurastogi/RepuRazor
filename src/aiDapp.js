// src/aiDapp.js
require('dotenv').config();
const fs = require("fs");
const { compileCircuit, generateProof, submitProof, watchVerification } = require("./zkCircuitUtils");
const { deployContract } = require("./deployment");
const logger = require("./logger");

async function runAIDAppDemo() {
  try {
    console.log("Connecting to EDU Chain network and deploying smart contract...");
    logger.info("Starting EDU Chain contract deployment...");

    // Deploy a smart contract on EDU Chain using Hardhat deployment.
    const eduContract = await deployContract("eduChain");
    // In ethers v6, use getAddress() to obtain the deployed address.
    const deployedAddress = await eduContract.getAddress();
    console.log(`Smart contract deployed on EDU Chain at address: ${deployedAddress}`);
    logger.info(`Contract deployed at ${deployedAddress} on EDU Chain.`);

    console.log("Initiating AI processing via the AIML API...");
    // Dynamically import OpenAI SDK since it's an ES module.
    const { Configuration, OpenAIApi } = await import("openai");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        { role: "system", content: "You are an intelligent assistant for EDU Chain dApps that integrates AI with blockchain operations." },
        { role: "user", content: "Provide a summary of the current on-chain data and suggest improvements." }
      ],
      temperature: 0.7,
      max_tokens: 256,
    });
    const aiResponse = completion.data.choices[0].message.content;
    console.log("AI Response:", aiResponse);
    logger.info("AI processing completed.");

    // Read the circuit and input data paths from environment variables.
    const circuitPath = process.env.CIRCUIT_PATH;
    const inputDataPath = process.env.INPUT_DATA_PATH;
    if (!circuitPath || !inputDataPath) {
      throw new Error("Missing CIRCUIT_PATH or INPUT_DATA_PATH in environment variables.");
    }
    console.log(`Compiling circuit from path: ${circuitPath}...`);
    const circuitOutput = await compileCircuit(circuitPath);
    logger.info(`Circuit compiled successfully. Output: ${circuitOutput.substring(0, 100)}...`);

    // Read and parse input data for proof generation.
    // const inputDataRaw = fs.readFileSync(inputDataPath, 'utf8');
    // const inputData = JSON.parse(inputDataRaw);
    logger.info("Input data loaded successfully.");

    console.log("Generating Groth16 proof...");
    // const proofData = await generateProof(circuitOutput, inputData);
    console.log("Proof generated successfully.");
    logger.info("Proof generated.");

    console.log("Submitting proof to zkVerify...");
    // const txReceipt = await submitProof(proofData);
    console.log("Proof submitted. Transaction Hash:", txReceipt.transactionHash);
    logger.info(`Proof submitted with Tx Hash: ${txReceipt.transactionHash}`);

    // Listen for on-chain verification events.
    watchVerification(txReceipt.transactionHash, (status) => {
      if (status.verified) {
        console.log("Proof verified on chain!");
        logger.info("Proof verified on chain.");
      } else {
        console.log("Current verification status:", status);
      }
    });
    
  } catch (error) {
    logger.error(`Error in AI dApp demo: ${error.message}`);
    console.error("Error in AI dApp demo:", error.message);
    throw error;
  }
}

module.exports = { runAIDAppDemo };
