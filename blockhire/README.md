# BlockHire

BlockHire is a Soroban-on-Stellar decentralized recruitment platform (scaffold).

This folder contains initial scaffolding for the BlockHire project:

- `contracts/` — Soroban Rust smart contract scaffold (CandidateRegistry & Verification stubs).
- `backend/` — placeholder for Node.js/TypeScript backend (IPFS pinning, API, verifiers).
- `frontend/` — placeholder for React/TypeScript frontend integrating soroban-js.

Next steps:
1. Implement and unit-test Soroban contracts in `contracts/`.
2. Build a Node.js backend for IPFS uploads and contract submissions.
3. Integrate frontend with wallet signing (soroban-js) and the backend.

Build notes (contracts):
- Install Rust toolchain and Soroban target for WASM builds.
- Example build: `cargo build --target wasm32-unknown-unknown --release` (run in `contracts/`).

See the top-level project document for more detailed design and implementation guidance.
