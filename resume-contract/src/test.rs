#[cfg(test)]
mod tests {

    use near_sdk::AccountId;
    use std::str::FromStr;

    use crate::{
        utils::{convert_account_id_to_did, get_current_time},
        DidContract, DidDocument,
    };

    #[test]
    fn test_reg_did() {
        use crate::DidContract;

        let mut contract = DidContract::default();

        contract.reg_did_using_account(String::from("test@example.com"));

        let did_list: Vec<String> = contract.get_total_did();

        println!("[+] did_list: {:?}", did_list);

        contract.reg_did_using_account(String::from("test@example.com"));
    }

    #[test]
    fn test_get_did_list() {
        let mut contract = DidContract::default();

        contract.reg_did_using_account(String::from("test@example.com"));

        let list: Vec<String> = contract.get_total_did();

        println!("list: {:?}", list);
    }

    #[test]
    fn test_get_did_document_list() {
        let mut contract = DidContract::default();

        contract.reg_did_using_account(String::from("test@example.com"));

        let list: Vec<DidDocument> = contract.get_total_document();

        println!("list: {:#?}", list);
    }

    #[test]
    fn test_get_current_time_test() {
        println!("time: {:?}", get_current_time());
    }

    #[test]
    fn test_convert_account_id_to_did() {
        let near_named_account: AccountId =
            AccountId::from_str("alice.testnet").unwrap();

        let did = convert_account_id_to_did(near_named_account);

        assert_eq!(did, "did:near:alice.testnet");
    }
}
