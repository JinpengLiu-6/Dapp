# Dapp

A modern Web3 social app built with React, TypeScript, Tailwind CSS, wagmi, viem, and RainbowKit.

This project is one of my personal Web3 projects, focused on building a decentralized social feed experience with wallet connection, IPFS content storage, and on-chain interactions on Ethereum Sepolia.

## Overview

The app allows users to:

- connect their wallet with RainbowKit
- create posts by uploading content to IPFS
- store post CIDs on-chain through a smart contract
- browse a decentralized social feed
- like posts on-chain
- receive real-time feed updates from contract events

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- wagmi + viem
- RainbowKit
- Solidity
- Hardhat
- IPFS (Pinata)
- Ethereum Sepolia

## Core Features

- Wallet connection with network detection
- ENS name support when available
- Post creation flow:
  - write content
  - upload to IPFS
  - submit CID to smart contract
- Real-time feed updates from `PostCreated` and `PostLiked` events
- Transaction lifecycle UX:
  - confirm in wallet
  - pending on-chain
  - success and error feedback
- Responsive dark-mode social feed UI

## Smart Contract

The Solidity contract supports:

- `createPost(string cid)`
- `likePost(uint postId)`
- `getPosts()`

Each post includes:

- author address
- IPFS CID
- timestamp
- like count

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Create a `.env.local` file and configure:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_SOCIAL_APP_CONTRACT_ADDRESS=your_contract_address
```

## Future Improvements

- user profiles
- comments and replies
- media uploads
- follow system
- better indexing for feed performance

## Author

Jinpeng Liu
