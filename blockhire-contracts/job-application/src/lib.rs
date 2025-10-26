#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum ApplicationStatus {
    Pending,
    UnderReview,
    Verified,
    Rejected,
    Accepted,
}

// Job posting on-chain
#[contracttype]
#[derive(Clone)]
pub struct JobPosting {
    pub job_id: u64,
    pub employer: Address,
    pub title: String,
    pub ipfs_details: String,     // Full job description on IPFS
    pub salary_range: String,
    pub is_active: bool,
    pub created_at: u64,
    pub application_count: u32,
}

// Job application linking candidate to job
#[contracttype]
#[derive(Clone)]
pub struct Application {
    pub application_id: u64,
    pub job_id: u64,
    pub candidate: Address,
    pub employer: Address,
    pub status: ApplicationStatus,
    pub candidate_profile_cid: String,  // Link to candidate profile
    pub cover_letter_cid: String,       // IPFS
    pub applied_at: u64,
    pub reviewed_at: Option<u64>,
    pub verification_notes: Option<String>,
}

#[contract]
pub struct JobApplicationContract;

#[contractimpl]
impl JobApplicationContract {
    
    /// Employer posts a job
    pub fn post_job(
        env: Env,
        employer: Address,
        title: String,
        ipfs_details: String,
        salary_range: String,
    ) -> JobPosting {
        employer.require_auth();
        
        let job_id = Self::get_next_job_id(&env);
        
        let job = JobPosting {
            job_id,
            employer: employer.clone(),
            title,
            ipfs_details,
            salary_range,
            is_active: true,
            created_at: env.ledger().timestamp(),
            application_count: 0,
        };
        
        env.storage().persistent().set(&(symbol_short!("job"), job_id), &job);
        env.storage().persistent().set(&symbol_short!("job_cnt"), &(job_id + 1));
        
        job
    }
    
    /// Candidate applies to a job
    pub fn apply_to_job(
        env: Env,
        candidate: Address,
        job_id: u64,
        candidate_profile_cid: String,
        cover_letter_cid: String,
    ) -> Application {
        candidate.require_auth();
        
        // Get job
        let job_key = (symbol_short!("job"), job_id);
        let mut job: JobPosting = env.storage().persistent()
            .get(&job_key)
            .expect("Job not found");
        
        assert!(job.is_active, "Job is not active");
        
        let application_id = Self::get_next_application_id(&env);
        
        let application = Application {
            application_id,
            job_id,
            candidate: candidate.clone(),
            employer: job.employer.clone(),
            status: ApplicationStatus::Pending,
            candidate_profile_cid,
            cover_letter_cid,
            applied_at: env.ledger().timestamp(),
            reviewed_at: None,
            verification_notes: None,
        };
        
        // Store application
        env.storage().persistent().set(
            &(symbol_short!("app"), application_id),
            &application
        );
        env.storage().persistent().set(&symbol_short!("app_cnt"), &(application_id + 1));
        
        // Update job application count
        job.application_count += 1;
        env.storage().persistent().set(&job_key, &job);
        
        application
    }
    
    /// Employer reviews application (marks as under review)
    pub fn review_application(
        env: Env,
        employer: Address,
        application_id: u64,
    ) -> Application {
        employer.require_auth();
        
        let app_key = (symbol_short!("app"), application_id);
        let mut application: Application = env.storage().persistent()
            .get(&app_key)
            .expect("Application not found");
        
        assert_eq!(application.employer, employer, "Not authorized");
        
        application.status = ApplicationStatus::UnderReview;
        application.reviewed_at = Some(env.ledger().timestamp());
        
        env.storage().persistent().set(&app_key, &application);
        application
    }
    
    /// Employer verifies candidate documents and marks application
    pub fn verify_application(
        env: Env,
        employer: Address,
        application_id: u64,
        verification_notes: String,
    ) -> Application {
        employer.require_auth();
        
        let app_key = (symbol_short!("app"), application_id);
        let mut application: Application = env.storage().persistent()
            .get(&app_key)
            .expect("Application not found");
        
        assert_eq!(application.employer, employer, "Not authorized");
        
        application.status = ApplicationStatus::Verified;
        application.verification_notes = Some(verification_notes);
        application.reviewed_at = Some(env.ledger().timestamp());
        
        env.storage().persistent().set(&app_key, &application);
        application
    }
    
    /// Employer rejects application
    pub fn reject_application(
        env: Env,
        employer: Address,
        application_id: u64,
        reason: String,
    ) -> Application {
        employer.require_auth();
        
        let app_key = (symbol_short!("app"), application_id);
        let mut application: Application = env.storage().persistent()
            .get(&app_key)
            .expect("Application not found");
        
        assert_eq!(application.employer, employer, "Not authorized");
        
        application.status = ApplicationStatus::Rejected;
        application.verification_notes = Some(reason);
        application.reviewed_at = Some(env.ledger().timestamp());
        
        env.storage().persistent().set(&app_key, &application);
        application
    }
    
    /// Employer accepts application
    pub fn accept_application(
        env: Env,
        employer: Address,
        application_id: u64,
    ) -> Application {
        employer.require_auth();
        
        let app_key = (symbol_short!("app"), application_id);
        let mut application: Application = env.storage().persistent()
            .get(&app_key)
            .expect("Application not found");
        
        assert_eq!(application.employer, employer, "Not authorized");
        
        application.status = ApplicationStatus::Accepted;
        application.reviewed_at = Some(env.ledger().timestamp());
        
        env.storage().persistent().set(&app_key, &application);
        application
    }
    
    /// Get job details
    pub fn get_job(env: Env, job_id: u64) -> Option<JobPosting> {
        env.storage().persistent().get(&(symbol_short!("job"), job_id))
    }
    
    /// Get application details
    pub fn get_application(env: Env, application_id: u64) -> Option<Application> {
        env.storage().persistent().get(&(symbol_short!("app"), application_id))
    }
    
    /// Close job posting
    pub fn close_job(env: Env, employer: Address, job_id: u64) -> JobPosting {
        employer.require_auth();
        
        let job_key = (symbol_short!("job"), job_id);
        let mut job: JobPosting = env.storage().persistent()
            .get(&job_key)
            .expect("Job not found");
        
        assert_eq!(job.employer, employer, "Not authorized");
        
        job.is_active = false;
        env.storage().persistent().set(&job_key, &job);
        job
    }
    
    // Helper functions
    fn get_next_job_id(env: &Env) -> u64 {
        env.storage().persistent()
            .get(&symbol_short!("job_cnt"))
            .unwrap_or(1)
    }
    
    fn get_next_application_id(env: &Env) -> u64 {
        env.storage().persistent()
            .get(&symbol_short!("app_cnt"))
            .unwrap_or(1)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_job_posting_and_application() {
        let env = Env::default();
        let contract_id = env.register_contract(None, JobApplicationContract);
        let client = JobApplicationContractClient::new(&env, &contract_id);
        
        let employer = Address::generate(&env);
        let candidate = Address::generate(&env);
        
        env.mock_all_auths();
        
        // Employer posts job
        let job = client.post_job(
            &employer,
            &String::from_str(&env, "Senior Rust Developer"),
            &String::from_str(&env, "QmJobDetails"),
            &String::from_str(&env, "100k-150k"),
        );
        
        assert_eq!(job.job_id, 1);
        assert_eq!(job.is_active, true);
        
        // Candidate applies
        let application = client.apply_to_job(
            &candidate,
            &1,
            &String::from_str(&env, "QmProfile"),
            &String::from_str(&env, "QmCoverLetter"),
        );
        
        assert_eq!(application.status, ApplicationStatus::Pending);
        assert_eq!(application.candidate, candidate);
    }
    
    #[test]
    fn test_application_verification_flow() {
        let env = Env::default();
        let contract_id = env.register_contract(None, JobApplicationContract);
        let client = JobApplicationContractClient::new(&env, &contract_id);
        
        let employer = Address::generate(&env);
        let candidate = Address::generate(&env);
        
        env.mock_all_auths();
        
        // Create job and application
        client.post_job(
            &employer,
            &String::from_str(&env, "Developer"),
            &String::from_str(&env, "QmJob"),
            &String::from_str(&env, "80k"),
        );
        
        client.apply_to_job(
            &candidate,
            &1,
            &String::from_str(&env, "QmProfile"),
            &String::from_str(&env, "QmCover"),
        );
        
        // Employer verifies
        let verified = client.verify_application(
            &employer,
            &1,
            &String::from_str(&env, "All documents verified"),
        );
        
        assert_eq!(verified.status, ApplicationStatus::Verified);
    }
}
