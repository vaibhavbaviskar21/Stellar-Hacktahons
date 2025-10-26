#!/bin/bash

# BlockHire Smart Contract Deployment Script
# Deploy all contracts to Stellar testnet

set -e

echo "🚀 Building BlockHire Smart Contracts..."

# Build contracts
cd blockhire-contracts
cargo build --target wasm32-unknown-unknown --release

echo "✅ Contracts built successfully!"

# Optimize WASM files
echo "📦 Optimizing WASM files..."

stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/candidate_profile.wasm \
  --wasm-out target/wasm32-unknown-unknown/release/candidate_profile_optimized.wasm

stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/job_application.wasm \
  --wasm-out target/wasm32-unknown-unknown/release/job_application_optimized.wasm

stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/document_verification.wasm \
  --wasm-out target/wasm32-unknown-unknown/release/document_verification_optimized.wasm

echo "✅ WASM files optimized!"

# Deploy to testnet
echo "🌐 Deploying to Stellar Testnet..."

# Deploy Candidate Profile Contract
echo "Deploying Candidate Profile Contract..."
CANDIDATE_CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/candidate_profile_optimized.wasm \
  --source-account default \
  --network testnet)

echo "✅ Candidate Profile Contract: $CANDIDATE_CONTRACT_ID"

# Deploy Job Application Contract
echo "Deploying Job Application Contract..."
JOB_CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/job_application_optimized.wasm \
  --source-account default \
  --network testnet)

echo "✅ Job Application Contract: $JOB_CONTRACT_ID"

# Deploy Document Verification Contract
echo "Deploying Document Verification Contract..."
DOC_CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/document_verification_optimized.wasm \
  --source-account default \
  --network testnet)

echo "✅ Document Verification Contract: $DOC_CONTRACT_ID"

# Save contract IDs to .env file
echo "💾 Saving contract IDs..."

cd ../blockhire
cat > .env.contracts << EOF
# BlockHire Smart Contract Addresses (Testnet)
# Generated: $(date)

NEXT_PUBLIC_CANDIDATE_CONTRACT_ID=$CANDIDATE_CONTRACT_ID
NEXT_PUBLIC_JOB_CONTRACT_ID=$JOB_CONTRACT_ID
NEXT_PUBLIC_DOC_VERIFICATION_CONTRACT_ID=$DOC_CONTRACT_ID
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
EOF

echo "✅ Contract IDs saved to .env.contracts"
echo ""
echo "📋 Contract Addresses:"
echo "   Candidate Profile: $CANDIDATE_CONTRACT_ID"
echo "   Job Application: $JOB_CONTRACT_ID"
echo "   Document Verification: $DOC_CONTRACT_ID"
echo ""
echo "🎉 Deployment complete! Copy .env.contracts content to your .env.local file"
