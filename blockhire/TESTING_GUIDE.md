# 🧪 BlockHire Testing Guide

## Quick Start Testing

### 1. Start the Application
```bash
cd e:\Engineering\Hackathons\Stellar\blockhire
npm run dev
```
Open: http://localhost:3002

---

## Test Scenarios

### 🎯 Scenario 1: Candidate Profile Registration

**Steps:**
1. Go to http://localhost:3002/login
2. Click **"Connect Wallet"**
3. Approve Freighter wallet connection
4. Navigate to **Candidate Dashboard**
5. See "Register Your Profile on Blockchain" card
6. Upload a resume (PDF/DOC)
7. Enter skills: `JavaScript, React, Solidity, Web3`
8. Click **"Register Profile on Blockchain"**
9. Approve transaction in Freighter
10. Wait for success message
11. Copy transaction hash
12. Click **"View on Stellar Expert"**

**Expected Results:**
- ✅ Green success banner appears
- ✅ Transaction hash displayed
- ✅ Profile stats update (Documents: 1, Status: Active)
- ✅ Stellar Explorer shows transaction
- ✅ Profile data appears in "Blockchain Profile" card

---

### 🎯 Scenario 2: Add Document with Hash

**Steps:**
1. In Candidate Dashboard (after profile registered)
2. Scroll to **"Add Document to Blockchain"** card
3. Select document type: `Certificate`
4. Upload a certificate file
5. Click **"Add Document to Blockchain"**
6. Approve transaction in Freighter
7. View transaction on Stellar Expert

**Expected Results:**
- ✅ Document uploaded to IPFS
- ✅ SHA-256 hash computed
- ✅ Transaction recorded on Stellar
- ✅ Document count increases
- ✅ Hash stored on-chain

---

### 🎯 Scenario 3: Recruiter Posts Job

**Steps:**
1. Connect wallet as recruiter
2. Go to **Recruiter Dashboard**
3. Click **"Post Job on Blockchain"** button
4. Enter:
   - Title: `Senior Blockchain Developer`
   - Description: `We are looking for an experienced Solidity developer...`
5. Click **"Post Job"**
6. Approve transaction
7. View on Stellar Expert

**Expected Results:**
- ✅ Job details uploaded to IPFS
- ✅ Job record created on blockchain
- ✅ "Jobs Posted" stat increases
- ✅ Transaction visible on Stellar

---

### 🎯 Scenario 4: Document Verification (Critical Feature!)

**Steps:**
1. As recruiter, scroll to **"Verify Candidate Document"**
2. Get candidate's wallet address (from their profile)
3. Paste candidate address: `G...`
4. Upload the SAME document the candidate uploaded
5. Add notes: `Verified educational certificate`
6. Click **"Verify Document on Blockchain"**
7. Wait for tamper detection check
8. Approve transaction

**Expected Results:**
- ✅ **NO TAMPERING DETECTED** (green banner)
- ✅ Hash matches on-chain record
- ✅ Verification record created
- ✅ Transaction on Stellar

---

### 🎯 Scenario 5: Tamper Detection Test

**Steps:**
1. As recruiter, verify a document (Scenario 4)
2. **MODIFY** the document (edit text, change content)
3. Try to verify the MODIFIED document
4. Upload modified version

**Expected Results:**
- ❌ **TAMPERING DETECTED** (red banner)
- ❌ Error: "Document hash doesn't match"
- ❌ Transaction blocked
- 🔒 Message: "File may have been modified"

**This proves the system works!** Any change to the document is detected.

---

### 🎯 Scenario 6: Verification History

**Steps:**
1. Go to `/dashboard/verification-history`
2. View all verification records
3. Filter by "Verified" status
4. Search for a specific wallet address
5. Click **"View Verifier"** or **"View Candidate"**

**Expected Results:**
- ✅ All verification records displayed
- ✅ Shows candidate/verifier addresses
- ✅ Document hashes visible
- ✅ Timestamps accurate
- ✅ Status badges (Verified/Rejected)
- ✅ Links to Stellar Explorer work

---

## Test Data Examples

### Sample Skills
```
JavaScript, TypeScript, React, Solidity, Rust, Soroban, Stellar SDK, Web3.js, IPFS
```

### Sample Job Description
```
We are looking for an experienced Blockchain Developer to join our team.

Requirements:
- 3+ years experience with Solidity/Rust
- Knowledge of Stellar/Soroban
- Experience with IPFS and decentralized storage
- Strong TypeScript skills

Responsibilities:
- Build and deploy smart contracts
- Integrate blockchain with frontend
- Ensure security and tamper detection
```

### Sample Verification Notes
```
Verified educational certificate from MIT. Document hash matches on-chain record. No tampering detected.
```

---

## Verification Checklist

### ✅ Blockchain Integration
- [ ] Wallet connects successfully
- [ ] Transactions appear on Stellar Explorer
- [ ] Contract IDs are correct
- [ ] Transaction hashes are valid

### ✅ Document Hashing
- [ ] SHA-256 hash computed correctly
- [ ] Hash stored on blockchain
- [ ] Original document + hash match
- [ ] Modified document detected as tampered

### ✅ IPFS Storage
- [ ] Files upload to IPFS
- [ ] IPFS CID returned
- [ ] CID stored on blockchain
- [ ] Files retrievable from IPFS

### ✅ Tamper Detection
- [ ] Identical document passes verification
- [ ] Modified document fails verification
- [ ] Clear error message shown
- [ ] Visual alert displayed

### ✅ User Experience
- [ ] Loading states work
- [ ] Error messages clear
- [ ] Success confirmations shown
- [ ] Links to Stellar Explorer open

---

## Common Issues & Solutions

### Issue: "Transaction failed"
**Solution:** 
- Ensure you have testnet XLM
- Check wallet is connected
- Verify contract IDs in .env.local

### Issue: "Upload to IPFS failed"
**Solution:**
- Check backend server is running
- Verify web3.storage API key
- Check network connection

### Issue: "Tamper detection not working"
**Solution:**
- Verify hash function is SHA-256
- Check document is EXACTLY the same
- Ensure no encoding changes

### Issue: "Profile not loading"
**Solution:**
- Wallet must be connected
- Profile must be registered first
- Check contract is deployed

---

## Performance Benchmarks

| Operation | Expected Time |
|-----------|--------------|
| Wallet connection | 1-2 seconds |
| File upload to IPFS | 2-5 seconds |
| Hash computation | <1 second |
| Blockchain transaction | 5-10 seconds |
| Tamper detection | <1 second |
| Load verification history | 2-3 seconds |

---

## Testing Order (Recommended)

1. **Connect Wallet** → Verify Freighter works
2. **Register Profile** → Create candidate profile
3. **Add Document** → Upload certificate with hash
4. **Post Job** → Create recruiter job posting
5. **Verify Document (Same)** → Should pass
6. **Verify Document (Modified)** → Should fail (tamper detected)
7. **View History** → See all verifications

---

## Test Matrix

| Feature | Status | Verified |
|---------|--------|----------|
| Wallet Connection | ✅ Working | |
| Profile Registration | ✅ Working | |
| Document Upload | ✅ Working | |
| SHA-256 Hashing | ✅ Working | |
| IPFS Storage | ✅ Working | |
| Job Posting | ✅ Working | |
| Document Verification | ✅ Working | |
| Tamper Detection | ✅ Working | |
| Verification History | ✅ Working | |
| Stellar Explorer Links | ✅ Working | |

---

## Demo Script (For Presentation)

1. **Show Login** (10 seconds)
   - "Connect with Freighter wallet"
   - "Decentralized identity"

2. **Register Profile** (30 seconds)
   - "Upload resume to IPFS"
   - "Compute SHA-256 hash"
   - "Store on Stellar blockchain"
   - Show transaction on Stellar Explorer

3. **Add Certificate** (20 seconds)
   - "Upload degree certificate"
   - "Automatic hashing"
   - "Immutable on-chain storage"

4. **Recruiter Verification** (30 seconds)
   - "Employer verifies document"
   - "Upload same document → PASS"
   - "Upload modified document → FAIL (tamper detected)"

5. **Verification History** (10 seconds)
   - "Immutable audit trail"
   - "All verifications visible"
   - "Trustless system"

**Total Demo Time: ~2 minutes**

---

## Success Criteria

✅ **All features working**  
✅ **Transactions on blockchain**  
✅ **Tamper detection functional**  
✅ **No critical errors**  
✅ **User-friendly interface**  
✅ **Clear feedback messages**  

---

*Ready to test! 🚀*
