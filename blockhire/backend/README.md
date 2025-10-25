# BlockHire Backend (scaffold)

This small Express backend provides two helpful endpoints for integrating the frontend with Soroban/Stellar CLI-based contract calls.

Endpoints
- GET /status
  - Returns whether the `stellar` CLI is available in PATH.
- POST /upload
  - multipart/form-data `file` field. Stores uploaded files in `backend/uploads` and returns file info.
- POST /invoke
  - Generic wrapper around `stellar contract invoke`.
  - JSON body: { contractId, functionName, args: [{ name, value }], source, network }
  - Executes the stellar CLI and returns stdout/stderr.

Notes
- This is intentionally minimal: it uses the `stellar` CLI to avoid depending on JS Soroban packages. It's suitable for local dev and testnet flows.
- For production you should:
  - Add authentication for signer operations.
  - Replace CLI calls with an RPC library (soroban-client / soroban-js) or a secure signer.
  - Integrate IPFS pinning (Infura, Web3.Storage, or Pinata) using API tokens stored in env vars.

Run locally
1. Install dependencies:
   cd backend
   npm install
2. Start:
   npm run dev

Connect from frontend
- Call POST http://localhost:4000/upload with form-data file
- Call POST http://localhost:4000/invoke with JSON, e.g.:
  {
    "contractId": "CDKFG3DDO2U...",
    "functionName": "hello",
    "args": [{"name": "to", "value": "metadataCidOrString"}],
    "source": "blockhire-deployer",
    "network": "testnet"
  }

This will execute the CLI: `stellar contract invoke --id ... --source blockhire-deployer -n testnet -- hello --to "metadataCidOrString"`.
