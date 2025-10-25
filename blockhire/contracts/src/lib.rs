#![no_std]

use soroban_sdk::{contract, contractimpl, vec, Env, String, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// A hello function that returns ["Hello", to]
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}

// This is the canonical minimal Soroban contract pattern from the docs. It
// compiles with the soroban-sdk and produces a WASM artifact suitable for
// deployment. We'll expand this into the BlockHire contracts in upcoming
// commits.
