# 🚀 BlockHire Deployment Guide

## Prerequisites

### 1. Install Stellar CLI
```powershell
cargo install --locked stellar-cli --features opt
```

### 2. Configure Stellar Testnet
```powershell
stellar config network add testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"
```

### 3. Create Identity & Fund Account
```powershell
# Generate identity
stellar config identity generate default

# Fund account with testnet XLM
stellar config identity fund default --network testnet

# Verify balance
stellar config identity address default
```

---

## Deploy Contracts

### Option 1: Automated Script (Linux/Mac/WSL)
```bash
cd blockhire-contracts
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment (Windows PowerShell)

#### Step 1: Optimize WASM Files
```powershell
cd blockhire-contracts

# Candidate Profile Contract
stellar contract optimize `
  --wasm target/wasm32-unknown-unknown/release/candidate_profile.wasm `
  --wasm-out target/wasm32-unknown-unknown/release/candidate_profile_opt.wasm

# Job Application Contract
stellar contract optimize `
  --wasm target/wasm32-unknown-unknown/release/job_application.wasm `
  --wasm-out target/wasm32-unknown-unknown/release/job_application_opt.wasm

# Document Verification Contract
stellar contract optimize `
  --wasm target/wasm32-unknown-unknown/release/document_verification.wasm `
  --wasm-out target/wasm32-unknown-unknown/release/document_verification_opt.wasm
```

#### Step 2: Deploy to Testnet
```powershell
# Deploy Candidate Profile Contract
$CANDIDATE_CONTRACT_ID = stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/candidate_profile_opt.wasm `
  --source default `
  --network testnet

Write-Host "Candidate Profile Contract: $CANDIDATE_CONTRACT_ID"

# Deploy Job Application Contract
$JOB_CONTRACT_ID = stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/job_application_opt.wasm `
  --source default `
  --network testnet

Write-Host "Job Application Contract: $JOB_CONTRACT_ID"

# Deploy Document Verification Contract
$DOC_CONTRACT_ID = stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/document_verification_opt.wasm `
  --source default `
  --network testnet

Write-Host "Document Verification Contract: $DOC_CONTRACT_ID"
```

#### Step 3: Save Contract IDs
```powershell
# Create .env.local file
cd ../blockhire

@"
# BlockHire Smart Contract Addresses (Testnet)
NEXT_PUBLIC_CANDIDATE_CONTRACT_ID=$CANDIDATE_CONTRACT_ID
NEXT_PUBLIC_JOB_CONTRACT_ID=$JOB_CONTRACT_ID
NEXT_PUBLIC_DOC_VERIFICATION_CONTRACT_ID=$DOC_CONTRACT_ID
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# IPFS Storage (Get from https://web3.storage)
WEB3_STORAGE_TOKEN=your_token_here
"@ | Out-File -FilePath .env.local -Encoding utf8
```

---

## Verify Deployment

### Test Contract Invocation
```powershell
# Test Candidate Profile Contract
stellar contract invoke `
  --id $CANDIDATE_CONTRACT_ID `
  --source default `
  --network testnet `
  -- get_profile `
  --candidate $(stellar config identity address default)
```

### Check Contract on Explorer
Visit: `https://stellar.expert/explorer/testnet/contract/{CONTRACT_ID}`

---

## Configure Frontend

### 1. Install Dependencies
```powershell
cd blockhire
npm install @stellar/stellar-sdk
```

### 2. Update .env.local
- Add contract IDs (done above)
- Get WEB3_STORAGE_TOKEN from https://web3.storage
- Add to `.env.local`

### 3. Test Integration
```powershell
npm run dev
```

Navigate to http://localhost:3001 and test:
1. Connect wallet
2. Register profile (should create transaction)
3. Check transaction on Stellar Expert

---

## Troubleshooting

### Error: "Account not found"
```powershell
# Fund your account
stellar config identity fund default --network testnet
```

### Error: "Contract deploy failed"
```powershell
# Check WASM file exists
ls target/wasm32-unknown-unknown/release/*.wasm

# Rebuild if needed
cargo build --target wasm32-unknown-unknown --release
```

### Error: "Insufficient balance"
```powershell
# Check balance
stellar contract invoke `
  --id CC6HTMQZAKKVDKMJKFZZZNP7KCYZV33YC5V6VNUKDWSM2DYG3Z7VGUFK `
  --source default `
  --network testnet `
  -- balance `
  --id $(stellar config identity address default)

# Fund again if needed
stellar config identity fund default --network testnet
```

---

## Next Steps

1. ✅ Contracts deployed
2. ✅ Contract IDs saved to .env.local
3. ⏭️ Update candidate dashboard to call contracts
4. ⏭️ Update recruiter dashboard to verify documents
5. ⏭️ Test end-to-end flow

See `IMPLEMENTATION.md` for full architecture details.

---

## Quick Reference

### Contract Locations
- **Candidate Profile**: `blockhire-contracts/candidate-profile/`
- **Job Application**: `blockhire-contracts/job-application/`
- **Document Verification**: `blockhire-contracts/document-verification/`

### Frontend Integration
- **Contract helpers**: `blockhire/lib/contracts.ts`
- **Wallet helpers**: `blockhire/lib/wallet.ts`
- **Context**: `blockhire/contexts/WalletContext.tsx`

### Stellar Resources
- **Testnet Explorer**: https://stellar.expert/explorer/testnet
- **Soroban RPC**: https://soroban-testnet.stellar.org
- **Horizon API**: https://horizon-testnet.stellar.org
- **Friendbot (Faucet)**: https://friendbot.stellar.org

---

**Ready to deploy? Run the commands above! 🚀**
