# BlockHire Smart Contracts

Decentralized recruitment platform smart contracts built on Stellar/Soroban.

## 📦 Contracts

### 1. Candidate Profile Contract (`candidate-profile/`)
**Purpose**: Manage candidate profiles and documents on-chain

**Features**:
- Register/update candidate profile with IPFS CID
- Add documents with cryptographic hashes
- Track verification status
- Employer verification of documents
- Tamper detection through hash comparison

**Key Functions**:
- `register_profile()` - Create or update candidate profile
- `add_document()` - Add document with hash for integrity
- `verify_document()` - Employer marks document as verified
- `get_profile()` - Retrieve candidate profile
- `get_document()` - Get specific document details

### 2. Job Application Contract (`job-application/`)
**Purpose**: Manage job postings and applications with verification workflow

**Features**:
- Employers post jobs with IPFS details
- Candidates apply with profile/cover letter CIDs
- Application status tracking (Pending → UnderReview → Verified/Rejected/Accepted)
- Immutable application history
- On-chain verification notes

**Key Functions**:
- `post_job()` - Employer creates job posting
- `apply_to_job()` - Candidate submits application
- `review_application()` - Mark application under review
- `verify_application()` - Verify candidate documents
- `reject_application()` / `accept_application()` - Final decision
- `get_job()` / `get_application()` - Query details

### 3. Document Verification Contract (`document-verification/`)
**Purpose**: Immutable audit trail of document verifications

**Features**:
- Create permanent verification records
- Track who verified what and when
- Query verification history by document or candidate
- Detect document tampering
- Count verified documents per candidate

**Key Functions**:
- `verify_document()` - Create verification record
- `get_verifications_by_hash()` - Get all verifications for a document
- `get_candidate_verifications()` - Get candidate's verification history
- `is_document_verified()` - Check if document has valid verification
- `detect_tampering()` - Compare hashes to detect changes

## 🏗️ Architecture

```
Candidate Flow:
1. Register profile → Candidate Profile Contract (stores IPFS CID + skills hash)
2. Upload resume → IPFS → Store hash on-chain
3. Apply to job → Job Application Contract (links profile + documents)

Employer Flow:
1. Post job → Job Application Contract (with IPFS details)
2. Review application → Access candidate profile from chain
3. Verify documents → Document Verification Contract (immutable record)
4. Update application status → Job Application Contract (Verified/Rejected/Accepted)

Verification:
- Documents hashed with SHA-256
- Hashes stored on-chain
- Re-hash document to detect tampering
- Verification history immutable and publicly auditable
```

## 🚀 Build & Deploy

### Prerequisites
```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Configure testnet
stellar config network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate identity
stellar config identity generate default
stellar config identity fund default --network testnet
```

### Build Contracts
```bash
cd blockhire-contracts
cargo build --target wasm32-unknown-unknown --release
```

### Deploy to Testnet
```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
1. Build all 3 contracts
2. Optimize WASM files
3. Deploy to Stellar testnet
4. Save contract IDs to `.env.contracts`

### Copy Contract IDs
```bash
# Copy generated .env.contracts to your frontend
cp .env.contracts ../blockhire/.env.local
```

## 🧪 Testing

Run contract tests:
```bash
cargo test
```

Run specific contract tests:
```bash
cargo test --package candidate-profile
cargo test --package job-application
cargo test --package document-verification
```

## 📊 Data Structures

### CandidateProfile
```rust
{
  wallet: Address,
  ipfs_cid: String,          // Resume on IPFS
  skills_hash: BytesN<32>,    // Hash for integrity
  is_verified: bool,
  verification_count: u32,
  created_at: u64,
  updated_at: u64
}
```

### Document
```rust
{
  doc_hash: BytesN<32>,       // SHA-256
  doc_type: String,           // "resume", "degree", etc.
  ipfs_cid: String,
  is_verified: bool,
  verified_by: Option<Address>,
  verified_at: Option<u64>
}
```

### Application
```rust
{
  application_id: u64,
  job_id: u64,
  candidate: Address,
  employer: Address,
  status: ApplicationStatus,  // Enum: Pending/UnderReview/Verified/Rejected/Accepted
  candidate_profile_cid: String,
  cover_letter_cid: String,
  applied_at: u64,
  reviewed_at: Option<u64>,
  verification_notes: Option<String>
}
```

### VerificationRecord
```rust
{
  record_id: u64,
  document_hash: BytesN<32>,
  candidate: Address,
  verifier: Address,
  doc_type: String,
  verification_status: bool,
  notes: String,
  timestamp: u64
}
```

## 🔒 Security Features

1. **Authentication**: All write operations require `require_auth()`
2. **Immutable Records**: Verification records cannot be modified
3. **Tamper Detection**: Document hashes prevent modification
4. **Access Control**: Only employers can verify, only candidates can update profiles
5. **Audit Trail**: All verifications permanently recorded with timestamp + verifier

## 🌐 Integration

See `../blockhire/lib/contracts.ts` for frontend integration helpers.

## 📝 License

MIT
