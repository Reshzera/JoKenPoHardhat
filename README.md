# JoKenPo Smart Contract Game

Welcome to the JoKenPo Ethereum blockchain game repository. This project uses Hardhat, a development environment for compiling, deploying, testing, and debugging Ethereum software. Our implementation of JoKenPo (Rock, Paper, Scissors) allows players to engage in the classic game using smart contracts for a trustless and decentralized gaming experience.

## Project Structure

- `contracts/` - Contains Solidity smart contracts that make up the game logic.
  - `IJoKenPo.sol` - Interface for the main JoKenPo game logic.
  - `JKPAdapter.sol` - Adapter contract for interacting with the main JoKenPo contract.
  - `JKPLibrary.sol` - Library containing the `Choice` enum used throughout the contracts.
  - `JoKenPo.sol` - The main game contract implementing the game logic and IJoKenPo interface.
- `scripts/` - Contains the deploy script for deploying contracts to a network.
- `test/` - Contains the Hardhat tests for the smart contracts.
- `.env` - Template for environment variables required for deployment (not to commit actual secrets).

## Contracts

### JoKenPo.sol

This is the main contract for the game. It handles game initialization, player interactions, and determining the outcome of the game.

### JKPAdapter.sol

The adapter contract is an additional layer that players interact with. It forwards calls to the main JoKenPo contract and can be used to upgrade the game logic while keeping the same interface.

### JKPLibrary.sol

A simple library defining the possible choices in the game: Rock, Paper, and Scissors.

## Quick Start

1. **Install dependencies**

```bash
yarn install
```

2. **Compile Contracts**

```bash
yarn compile
```

3. **Run Tests**

```bash
yarn test
```

4. **Start Local Blockchain Node**

```bash
yarn start
```

5. **Deploy Contracts**

To deploy to a local network:

```bash
yarn deploy:dev
```

To deploy to the Sepolia testnet:

```bash
yarn deploy:sepolia
```

## Environment Setup

Make sure to create a `.env` file with the following variables:

- `SEPOLIA_MNEMONIC`: Your wallet mnemonic for the Sepolia network.
- `SEPOLIA_URL`: The RPC URL for connecting to the Sepolia network.
- `ETHERSCAN_API_KEY`: Your Etherscan API key for verifying contracts.

**Note:** Do not commit your `.env` file with your secrets!

## Interacting with the Contracts

You can interact with the contracts through the Hardhat console or by writing scripts that utilize the `ethers` library included as a dependency.
