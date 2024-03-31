use crate::DidContract;
use crate::DidContractExt;
use crate::DidDocument;
use crate::DID;

use near_sdk::AccountId;
use near_sdk::{env, log, near_bindgen};

#[near_bindgen]
impl DidContract {
    pub fn get_total_did(&self) -> Vec<String> {
        self.map_account_to_did.values().collect()
    }

    pub fn get_total_document(&self) -> Vec<DidDocument> {
        self.map_did_to_document.values().collect()
    }

    pub fn get_did_document(&self, did: DID) -> DidDocument {
        let res = self.map_did_to_document.get(&did);

        match res {
            Some(v) => v,
            None => {
                env::panic_str(&format!("Unregistered DID, did: {}", did));
            }
        }
    }
}

pub fn convert_account_id_to_did(near_named_account: AccountId) -> DID {
    format!("did:near:{}", near_named_account)
}

pub fn check_grade(txt: &String) {
    let v = txt.as_str();
    if !(v == "A" || v == "B" || v == "C" || v == "D") {
        env::panic_str("invalid grade");
    }
}

pub fn get_current_time() -> String {
    let seconds = env::block_timestamp() / 1_000_000_000u64;

    log!(format!("unix timestamp (secs): {:?}", seconds));

    // 원하는 형식으로 포맷팅
    let formatted_time = format!(
        "{}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        1970 + seconds / 31556952,    // 년도
        (seconds / 2629743) % 12 + 1, // 월
        (seconds / 86400) % 30 + 1,   // 일
        (seconds / 3600) % 24 + 1,    // 시간
        (seconds / 60) % 60,          // 분
        (seconds) % 60                // 초
    );

    formatted_time
}
