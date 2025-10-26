#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, BytesN, Vec, symbol_short};

// Immutable verification record
#[contracttype]
#[derive(Clone)]
pub struct VerificationRecord {
    pub record_id: u64,
    pub document_hash: BytesN<32>,
    pub candidate: Address,
    pub verifier: Address,           // Employer who verified
    pub doc_type: String,            // "resume", "degree", "certificate"
    pub verification_status: bool,   // true = verified, false = tampered/invalid
    pub notes: String,               // Verification notes
    pub timestamp: u64,
}

#[contract]
pub struct DocumentVerificationContract;

#[contractimpl]
impl DocumentVerificationContract {
    
    /// Employer creates a verification record for a document
    pub fn verify_document(
        env: Env,
        verifier: Address,
        candidate: Address,
        document_hash: BytesN<32>,
        doc_type: String,
        is_valid: bool,
        notes: String,
    ) -> VerificationRecord {
        verifier.require_auth();
        
        let record_id = Self::get_next_record_id(&env);
        
        let record = VerificationRecord {
            record_id,
            document_hash: document_hash.clone(),
            candidate: candidate.clone(),
            verifier: verifier.clone(),
            doc_type,
            verification_status: is_valid,
            notes,
            timestamp: env.ledger().timestamp(),
        };
        
        // Store by record ID
        env.storage().persistent().set(&(symbol_short!("rec"), record_id), &record);
        
        // Store by document hash for quick lookup
        let hash_key = (symbol_short!("hash"), document_hash.clone());
        let mut records: Vec<u64> = env.storage().persistent()
            .get(&hash_key)
            .unwrap_or(Vec::new(&env));
        records.push_back(record_id);
        env.storage().persistent().set(&hash_key, &records);
        
        // Store by candidate for history lookup
        let candidate_key = (symbol_short!("cand"), candidate.clone());
        let mut candidate_records: Vec<u64> = env.storage().persistent()
            .get(&candidate_key)
            .unwrap_or(Vec::new(&env));
        candidate_records.push_back(record_id);
        env.storage().persistent().set(&candidate_key, &candidate_records);
        
        // Update counter
        env.storage().persistent().set(&symbol_short!("rec_cnt"), &(record_id + 1));
        
        record
    }
    
    /// Get verification record by ID
    pub fn get_record(env: Env, record_id: u64) -> Option<VerificationRecord> {
        env.storage().persistent().get(&(symbol_short!("rec"), record_id))
    }
    
    /// Get all verification records for a document hash
    pub fn get_verifications_by_hash(
        env: Env,
        document_hash: BytesN<32>,
    ) -> Vec<VerificationRecord> {
        let hash_key = (symbol_short!("hash"), document_hash);
        let record_ids: Vec<u64> = env.storage().persistent()
            .get(&hash_key)
            .unwrap_or(Vec::new(&env));
        
        let mut records = Vec::new(&env);
        for id in record_ids.iter() {
            if let Some(record) = Self::get_record(env.clone(), id) {
                records.push_back(record);
            }
        }
        records
    }
    
    /// Get all verification records for a candidate
    pub fn get_candidate_verifications(
        env: Env,
        candidate: Address,
    ) -> Vec<VerificationRecord> {
        let candidate_key = (symbol_short!("cand"), candidate);
        let record_ids: Vec<u64> = env.storage().persistent()
            .get(&candidate_key)
            .unwrap_or(Vec::new(&env));
        
        let mut records = Vec::new(&env);
        for id in record_ids.iter() {
            if let Some(record) = Self::get_record(env.clone(), id) {
                records.push_back(record);
            }
        }
        records
    }
    
    /// Check if a document has been verified (at least one valid verification)
    pub fn is_document_verified(
        env: Env,
        document_hash: BytesN<32>,
    ) -> bool {
        let verifications = Self::get_verifications_by_hash(env, document_hash);
        
        for record in verifications.iter() {
            if record.verification_status {
                return true;
            }
        }
        false
    }
    
    /// Get verification count for a candidate
    pub fn get_verification_count(
        env: Env,
        candidate: Address,
    ) -> u32 {
        let records = Self::get_candidate_verifications(env, candidate);
        let mut count = 0u32;
        for record in records.iter() {
            if record.verification_status {
                count += 1;
            }
        }
        count
    }
    
    /// Detect if document has been tampered (hash mismatch)
    pub fn detect_tampering(
        env: Env,
        original_hash: BytesN<32>,
        current_hash: BytesN<32>,
    ) -> bool {
        // Returns true if document was tampered
        original_hash != current_hash
    }
    
    // Helper function
    fn get_next_record_id(env: &Env) -> u64 {
        env.storage().persistent()
            .get(&symbol_short!("rec_cnt"))
            .unwrap_or(1)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_document_verification() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DocumentVerificationContract);
        let client = DocumentVerificationContractClient::new(&env, &contract_id);
        
        let verifier = Address::generate(&env);
        let candidate = Address::generate(&env);
        let doc_hash = BytesN::from_array(&env, &[1u8; 32]);
        
        env.mock_all_auths();
        
        let record = client.verify_document(
            &verifier,
            &candidate,
            &doc_hash,
            &String::from_str(&env, "degree"),
            &true,
            &String::from_str(&env, "MIT degree verified"),
        );
        
        assert_eq!(record.verification_status, true);
        assert_eq!(record.verifier, verifier);
        
        // Check if document is verified
        let is_verified = client.is_document_verified(&doc_hash);
        assert_eq!(is_verified, true);
    }
    
    #[test]
    fn test_tampering_detection() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DocumentVerificationContract);
        let client = DocumentVerificationContractClient::new(&env, &contract_id);
        
        let original_hash = BytesN::from_array(&env, &[1u8; 32]);
        let tampered_hash = BytesN::from_array(&env, &[2u8; 32]);
        
        let is_tampered = client.detect_tampering(&original_hash, &tampered_hash);
        assert_eq!(is_tampered, true);
        
        let not_tampered = client.detect_tampering(&original_hash, &original_hash);
        assert_eq!(not_tampered, false);
    }
}
