use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, log, near_bindgen, AccountId};

mod did_document;
mod test;
mod utils;

use did_document::*;
use utils::convert_account_id_to_did;

pub type Validity = bool;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
struct DidContract {
    // Mapping: NEAR account --> NEAR DID
    pub map_account_to_did: UnorderedMap<AccountId, DID>,

    // Mapping: NEAR DID --> NEAR DID Document
    pub map_did_to_document: UnorderedMap<DID, DidDocument>,
}

impl Default for DidContract {
    fn default() -> Self {
        Self {
            map_account_to_did: UnorderedMap::new(b"l"),
            map_did_to_document: UnorderedMap::new(b"d"),
        }
    }
}

#[near_bindgen]
impl DidContract {
    #[payable]
    pub fn reg_did_using_account(&mut self, email: String) {
        let near_named_account: AccountId = env::predecessor_account_id();

        let did: String = match self.map_account_to_did.get(&near_named_account)
        {
            Some(did) => {
                log!("already registered!, did: {:?}", did);
                did
            }
            None => {
                // registering...
                let did: String = format!("did:near:{}", near_named_account);

                log!("registered new did!: {:?}", did);

                self.map_account_to_did.insert(&near_named_account, &did);

                did
            }
        };

        // 2. Register DID Document
        let pk_base58 = {
            let pk_bytes = env::signer_account_pk();
            let pk_bs58 = bs58::encode(pk_bytes.as_bytes());
            let pk_string = &pk_bs58.into_string()[1..];

            pk_string.to_string()
        };

        log!("pk_base58: {:?}", pk_base58);

        let public_key = DidPublicKey {
            id: did.clone(),
            auth_type: "Ed25519VerificationKey2020".to_string(),
            controller: did.clone(),
            public_key_base_58: pk_base58,
        };

        // // time
        let formatted_time = utils::get_current_time();

        let did_document = DidDocument {
            context: vec![String::from("https://www.w3.org/ns/did/v1")],
            id: did.clone(),
            email,
            public_key: vec![public_key],
            created: formatted_time.clone(),
            updated: formatted_time,
            skill_proof: SkillProof::default(),
        };

        self.map_did_to_document.insert(&did, &did_document);
    }

    #[payable]
    pub fn update_skills(
        &mut self,
        java: Option<String>,
        solidity: Option<String>,
        python: Option<String>,
        c: Option<String>,
        cpp: Option<String>,
        javascript: Option<String>,
        typescript: Option<String>,
    ) {
        let near_named_account: AccountId = env::predecessor_account_id();

        let did: String = match self.map_account_to_did.get(&near_named_account)
        {
            Some(v) => v,
            None => env::panic_str("unregistered did"),
        };

        let mut did_document = self.map_did_to_document.get(&did).unwrap();

        match java {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.java = v;
            }
            None => {}
        }

        match solidity {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.solidity = v;
            }
            None => {}
        }

        match python {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.python = v;
            }
            None => {}
        }

        match c {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.c = v;
            }
            None => {}
        }

        match cpp {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.cpp = v;
            }
            None => {}
        }

        match javascript {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.javascript = v;
            }
            None => {}
        }

        match typescript {
            Some(v) => {
                utils::check_grade(&v);
                did_document.skill_proof.typescript = v;
            }
            None => {}
        }

        did_document.updated = utils::get_current_time();

        self.map_did_to_document.insert(&did, &did_document);
    }
}
