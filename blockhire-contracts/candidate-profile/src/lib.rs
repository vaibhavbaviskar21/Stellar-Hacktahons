#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, BytesN};

// Candidate profile stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct CandidateProfile {
    pub wallet: Address,
    pub ipfs_cid: String,           // Resume/documents on IPFS
    pub skills_hash: BytesN<32>,     // Hash of skills for integrity
    pub is_verified: bool,           // Profile verification status
    pub verification_count: u32,     // Number of verified documents
    pub created_at: u64,            // Timestamp
    pub updated_at: u64,
}

// Individual document record
#[contracttype]
#[derive(Clone)]
pub struct Document {
    pub doc_hash: BytesN<32>,       // SHA-256 hash of document
    pub doc_type: String,           // "resume", "degree", "certificate"
    pub ipfs_cid: String,           // IPFS storage
    pub is_verified: bool,
    pub verified_by: Option<Address>, // Employer who verified
    pub verified_at: Option<u64>,
}

#[contract]
pub struct CandidateProfileContract;

#[contractimpl]
impl CandidateProfileContract {
    
    /// Register or update candidate profile
    pub fn register_profile(
        env: Env,
        candidate: Address,
        ipfs_cid: String,
        skills_hash: BytesN<32>,
    ) -> CandidateProfile {
        candidate.require_auth();
        
        let timestamp = env.ledger().timestamp();
        let profile_key = (candidate.clone(),);
        
        // Check if profile exists
        let existing: Option<CandidateProfile> = env.storage().persistent().get(&profile_key);
        
        let profile = match existing {
            Some(mut p) => {
                // Update existing profile
                p.ipfs_cid = ipfs_cid;
                p.skills_hash = skills_hash;
                p.updated_at = timestamp;
                p
            },
            None => {
                // Create new profile
                CandidateProfile {
                    wallet: candidate.clone(),
                    ipfs_cid,
                    skills_hash,
                    is_verified: false,
                    verification_count: 0,
                    created_at: timestamp,
                    updated_at: timestamp,
                }
            }
        };
        
        env.storage().persistent().set(&profile_key, &profile);
        profile
    }
    
    /// Add a document to candidate's profile
    pub fn add_document(
        env: Env,
        candidate: Address,
        doc_hash: BytesN<32>,
        doc_type: String,
        ipfs_cid: String,
    ) -> Document {
        candidate.require_auth();
        
        let document = Document {
            doc_hash: doc_hash.clone(),
            doc_type,
            ipfs_cid,
            is_verified: false,
            verified_by: None,
            verified_at: None,
        };
        
        let doc_key = (candidate, doc_hash);
        env.storage().persistent().set(&doc_key, &document);
        document
    }
    
    /// Employer verifies a candidate's document
    pub fn verify_document(
        env: Env,
        employer: Address,
        candidate: Address,
        doc_hash: BytesN<32>,
    ) -> Document {
        employer.require_auth();
        
        let doc_key = (candidate.clone(), doc_hash);
        let mut document: Document = env.storage().persistent()
            .get(&doc_key)
            .expect("Document not found");
        
        // Mark document as verified
        document.is_verified = true;
        document.verified_by = Some(employer);
        document.verified_at = Some(env.ledger().timestamp());
        
        env.storage().persistent().set(&doc_key, &document);
        
        // Increment verification count on profile
        let profile_key = (candidate.clone(),);
        if let Some(mut profile) = env.storage().persistent().get::<_, CandidateProfile>(&profile_key) {
            profile.verification_count += 1;
            if profile.verification_count >= 1 {
                profile.is_verified = true;
            }
            env.storage().persistent().set(&profile_key, &profile);
        }
        
        document
    }
    
    /// Get candidate profile
    pub fn get_profile(env: Env, candidate: Address) -> Option<CandidateProfile> {
        let profile_key = (candidate,);
        env.storage().persistent().get(&profile_key)
    }
    
    /// Get specific document
    pub fn get_document(
        env: Env,
        candidate: Address,
        doc_hash: BytesN<32>,
    ) -> Option<Document> {
        let doc_key = (candidate, doc_hash);
        env.storage().persistent().get(&doc_key)
    }
    
    /// Get all documents for a candidate (returns hashes)
    pub fn get_candidate_documents(
        env: Env,
        candidate: Address,
    ) -> Vec<BytesN<32>> {
        // Note: In production, you'd use a secondary index or events
        // This is a simplified version
        Vec::new(&env)
    }
    
    /// Check if document hash matches (for tamper detection)
    pub fn verify_document_integrity(
        env: Env,
        candidate: Address,
        doc_hash: BytesN<32>,
        current_hash: BytesN<32>,
    ) -> bool {
        doc_hash == current_hash
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_register_profile() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CandidateProfileContract);
        let client = CandidateProfileContractClient::new(&env, &contract_id);
        
        let candidate = Address::generate(&env);
        let ipfs_cid = String::from_str(&env, "QmTest123");
        let skills_hash = BytesN::from_array(&env, &[1u8; 32]);
        
        env.mock_all_auths();
        
        let profile = client.register_profile(&candidate, &ipfs_cid, &skills_hash);
        
        assert_eq!(profile.wallet, candidate);
        assert_eq!(profile.ipfs_cid, ipfs_cid);
        assert_eq!(profile.is_verified, false);
    }
    
    #[test]
    fn test_add_and_verify_document() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CandidateProfileContract);
        let client = CandidateProfileContractClient::new(&env, &contract_id);
        
        let candidate = Address::generate(&env);
        let employer = Address::generate(&env);
        let doc_hash = BytesN::from_array(&env, &[2u8; 32]);
        let doc_type = String::from_str(&env, "resume");
        let ipfs_cid = String::from_str(&env, "QmDoc456");
        
        env.mock_all_auths();
        
        // Add document
        let doc = client.add_document(&candidate, &doc_hash, &doc_type, &ipfs_cid);
        assert_eq!(doc.is_verified, false);
        
        // Employer verifies
        let verified_doc = client.verify_document(&employer, &candidate, &doc_hash);
        assert_eq!(verified_doc.is_verified, true);
        assert_eq!(verified_doc.verified_by, Some(employer));
    }
}
