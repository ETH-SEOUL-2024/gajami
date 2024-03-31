import { getKeys, isPassKeyAvailable } from '@near-js/biometric-ed25519/lib';
import { KeyPairEd25519 } from '@near-js/crypto';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom/dist';

import { fetchAccountIds } from '../api';
// eslint-disable-next-line import/no-cycle
import FastAuthController from '../lib/controller';
import { safeGetLocalStorage } from '../utils';
import { networkId } from '../utils/config';
import { checkFirestoreReady, firebaseAuth } from '../utils/firebase';

type AuthState = 'loading' | boolean | Error

export const getAuthState = async (email?: string | null): Promise<AuthState> => {
  try {
    const controllerState = await window.fastAuthController.isSignedIn();
    const isFirestoreReady = await checkFirestoreReady();
    const isPasskeySupported = await isPassKeyAvailable();

    const webauthnUsername = safeGetLocalStorage('webauthn_username');
    if (webauthnUsername === undefined) {
      return new Error('Please allow third party cookies');
    }
    if (controllerState === true) {
      return true;
    }

    if (isPasskeySupported && (!webauthnUsername || (email && email !== webauthnUsername))) {
      return false;
    } if (isFirestoreReady && firebaseAuth.currentUser) {
      const oidcToken = await firebaseAuth.currentUser.getIdToken();
      const localStoreKey = await window.fastAuthController.getLocalStoreKey(`oidc_keypair_${oidcToken}`);

      if (localStoreKey) {
        const account = await window.fastAuthController.recoverAccountWithOIDCToken(oidcToken);

        if (!account) return false;

        window.fastAuthController = new FastAuthController({
          accountId: account?.accountId,
          networkId
        });

        await window.fastAuthController.setKey(new KeyPairEd25519(localStoreKey.toString().split(':')[1]));

        return true;
      }
    } if (isPasskeySupported && webauthnUsername) {
      const keypairs = await getKeys(webauthnUsername);
      const accounts = await Promise.allSettled(
        keypairs.map(async (k) => {
          const accIds = await fetchAccountIds(k.getPublicKey().toString(), { returnEmpty: true });
          return accIds.map((accId) => { return { accId, keyPair: k }; });
        })
      );

      const accountsList = accounts
        .flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

      if (accountsList.length === 0) {
        return false;
      }

      window.fastAuthController = new FastAuthController({
        accountId: accountsList[0].accId,
        networkId
      });

      await window.fastAuthController.setKey(new KeyPairEd25519(accountsList[0].keyPair.toString().split(':')[1]));
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

export const useAuthState = (): {authenticated: AuthState} => {
  const [authenticated, setAuthenticated] = useState<AuthState>('loading');
  const [query] = useSearchParams();
  const email = query.get('email');

  useEffect(() => {
    const handleAuthState = async () => {
      console.log('email', email);
      setAuthenticated(await getAuthState(email));
    };

    handleAuthState();
  }, [email]);

  return { authenticated };
};
