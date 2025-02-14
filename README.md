# RepuRazor

# repurazor

**repurazor** is a CLI tool designed for zero-knowledge proof challenges and smart contract integrations. It provides developers with a gamified environment to:

- **Start Challenges:** Load and explore predefined ZK challenges.
- **Compile Circuits:** Compile ZK circuits (using Circom or similar tools).
- **Verify Proofs:** Generate, submit, and monitor proofs via the `zkverifyjs` library.
- **Deploy Smart Contracts:** Deploy contracts to supported networks.
- **Fetch Sponsor Updates:** Retrieve sponsor-driven bonus challenges and updates.

> **Note:** This tool leverages ES modules (chalk, inquirer, etc.) via dynamic imports. Please ensure you have Node.js v14+ installed.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Running the CLI](#running-the-cli)
  - [Available Commands](#available-commands)
    - [start `<challengeId>`](#start-challengeid)
    - [build `<circuitPath>`](#build-circuitpath)
    - [verify `<challengeId> <inputFile>`](#verify-challengeid-inputfile)
    - [deploy `<network>`](#deploy-network)
    - [sponsor](#sponsor)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contribution](#contribution)
- [License](#license)

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/pranshurastogi/RepuRazor.git
   cd RepuRazor
```


Install Dependencies:

Run the following command to install all required packages:

bash
Copy
npm install
(Optional) Global Installation:

If you wish to use the CLI globally, run:

bash
Copy
npm install -g .
Then you can run the command using:

bash
Copy
repurazor [command] [options]
Usage
Running the CLI
If installed locally, you can run the CLI with:

bash
Copy
npm start [command] [options]
For example, to see the help menu:

bash
Copy
npm start
Or, if installed globally:

bash
Copy
repurazor
Available Commands
start <challengeId>
Starts a zero-knowledge challenge by loading challenge details from the challenges directory.

Example:

bash
Copy
npm start start challenge-01
This command will display the title and description of the challenge with ID challenge-01.

build <circuitPath>
Compiles a ZK circuit using Circom.

Example:

bash
Copy
npm start build circuits/arithmetic.circom
This will invoke the circuit compiler and display the output. Errors during compilation will be logged with clear error messages.

verify <challengeId> <inputFile>
Generates and verifies a proof for a given challenge. The process includes:

Loading the challenge definition.
Compiling the associated circuit.
Generating a proof using provided input data.
Submitting the proof via zkverifyjs.
Watching for verification status updates.
Example:

bash
Copy
npm start verify challenge-01 data/sample.json
Ensure that data/sample.json contains the required input data.

deploy <network>
Deploys a smart contract to the specified network. The network configuration is read from the configuration file.

Example:

bash
Copy
npm start deploy arbitrum
Make sure you have set up your network configuration (see Configuration).

sponsor
Fetches sponsor updates and bonus challenges from an external API.

Example:

bash
Copy
npm start sponsor
This will display the latest sponsor updates and any additional challenge information.

Configuration
Create a configuration file at config/zkquest.config.json to store your network settings. For example:

json
Copy
{
  "arbitrum": {
    "rpcUrl": "https://arbitrum-testnet.rpc.url",
    "privateKey": "YOUR_PRIVATE_KEY"
  },
  "eduChain": {
    "rpcUrl": "https://educhain-testnet.rpc.url",
    "privateKey": "YOUR_PRIVATE_KEY"
  }
}
Replace the rpcUrl and privateKey with your actual network details. This file is used by the deployment module to connect to blockchain networks.

Project Structure
graphql
Copy
RepuRazor/
├── bin/
│   └── index.js           # CLI entry point
├── config/
│   └── zkquest.config.json  # Network and other configuration settings
├── challenges/            # Challenge definitions (JSON files)
│   ├── challenge-01.json
│   └── challenge-02.json
├── data/                  # Sample input files for verification proofs
├── src/
│   ├── cli.js             # CLI command definitions (using Commander)
│   ├── challengeManager.js  # Module to load challenge definitions
│   ├── zkCircuitUtils.js  # Module for compiling circuits, generating proofs, and submission
│   ├── sponsorIntegration.js  # Module to fetch sponsor updates via Axios
│   ├── deployment.js      # Module for smart contract deployment (using Ethers.js)
│   └── leaderboard.js     # Module to manage scoring and leaderboard data
├── leaderboard.json       # Stores score data
├── package.json           # Project metadata and dependencies
└── README.md              # This file
Troubleshooting
Module Not Found / Dependency Issues:
Ensure all dependencies are installed by running npm install.

ES Module Errors:
This CLI uses dynamic imports for ES modules (e.g., chalk, inquirer). If you experience related errors, verify you’re running Node.js v14+.

Network Issues During Deployment:
Double-check your config/zkquest.config.json for correct RPC URLs and keys.

Verification Errors:
Look at the console logs for detailed error messages during proof generation, submission, or verification. Adjust your input data and ensure your ZK circuits compile successfully.

Contribution
Contributions are welcome! To contribute:

Fork the Repository:
Click the “Fork” button on GitHub to create your own copy.

Make Changes:
Implement new features or fix bugs. Make sure to add appropriate error handling and tests.

Submit a Pull Request:
Open a pull request with a detailed description of your changes.

Please follow the existing code style and ensure all tests pass.

License
This project is licensed under the ISC License.

Final Notes
Running Commands:
Always use the full command as specified (e.g., npm start verify challenge-01 data/sample.json).

Further Enhancements:
Consider adding more interactive prompts using Inquirer, extending challenge definitions, and integrating additional ZK proof methods.

Happy coding and good luck with your zero-knowledge projects!

yaml
Copy

---

You can now download or save this file as `README.md`.

 frequent virus lock salad ten evolve mosquito laugh dinosaur mouse visit trust