use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::Serialize;

use crate::utils;

pub type DID = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Default, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct DidPublicKey {
    pub id: DID,
    pub auth_type: String,
    pub controller: DID,
    pub public_key_base_58: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Debug, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct SkillProof {
    pub java: String,
    pub solidity: String,
    pub python: String,
    pub c: String,
    pub cpp: String,
    pub javascript: String,
    pub typescript: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct DidDocument {
    pub context: Vec<String>,
    pub id: DID,
    pub email: String,
    pub public_key: Vec<DidPublicKey>,
    pub created: String,
    pub updated: String,
    pub skill_proof: SkillProof,
}

impl Default for DidDocument {
    fn default() -> Self {
        let formatted_time: String = utils::get_current_time();

        Self {
            context: vec![String::from("")],
            id: DID::default(),
            email: String::default(),
            public_key: vec![DidPublicKey::default()],
            created: formatted_time.clone(),
            updated: formatted_time.clone(),
            skill_proof: SkillProof::default(),
        }
    }
}
