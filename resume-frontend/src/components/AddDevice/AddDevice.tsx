import { sendSignInLinkToEmail } from 'firebase/auth';

import { basePath } from '../../utils/config';
import { firebaseAuth } from '../../utils/firebase';

export const handleCreateAccount = async ({
  accountId, email, isRecovery, success_url, failure_url, public_key, contract_id, methodNames
}) => {
  const searchParams = new URLSearchParams({
    ...(accountId ? { accountId } : {}),
    ...(isRecovery ? { isRecovery } : {}),
    ...(success_url ? { success_url } : {}),
    ...(failure_url ? { failure_url } : {}),
    ...(public_key ? { public_key_lak: public_key } : {}),
    ...(contract_id ? { contract_id } : {}),
    ...(methodNames ? { methodNames } : {})
  });

  await sendSignInLinkToEmail(firebaseAuth, email, {
    url: encodeURI(
      `${window.location.origin}${basePath ? `/${basePath}` : ''}/auth-callback?${searchParams.toString()}`,
    ),
    handleCodeInApp: true,
  });
  window.localStorage.setItem('emailForSignIn', email);
  return {
    accountId,
  };
};
