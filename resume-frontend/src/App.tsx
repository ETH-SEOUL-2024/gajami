import debug from 'debug';
import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthCallbackPage from './components/AuthCallback/AuthCallback';
import AuthIndicator from './components/AuthIndicator/AuthIndicator';
import CreateAccount from './components/CreateAccount/CreateAccount';
import Devices from './components/Devices/Devices';
import Login from './components/Login/Login';
import ProfilePage from './components/Profile/Profile';
import RemoveTrailingSlash from './components/RemoveTrailingSlash/RemoveTrailingSlash';
import RpcRoute from './components/RpcRoute/RpcRoute';
import Sign from './components/Sign/Sign';
import SignMultichain from './components/SignMultichain/SignMultichain';
import VerifyEmailPage from './components/VerifyEmail/verify-email';
import FastAuthController from './lib/controller';
import FirestoreController from './lib/firestoreController';
import './styles/globals.css';
import GlobalStyle from './styles/index';
import './styles/theme.css';
import { initAnalytics } from './utils/analytics';
import { basePath, networkId } from './utils/config';

(window as any).fastAuthController = new FastAuthController({
  accountId: '',
  networkId,
});

if (!window.firestoreController) {
  window.firestoreController = new FirestoreController();
}

const faLog = debug('fastAuth');
const log = faLog.extend('App');
const log2 = log.extend('watwat');

// @ts-ignore
console.log('process.env.debug', process.env.DEBUG);

// @ts-ignore
console.log('faLog', faLog.enabled);
// @ts-ignore
console.log('log', log.enabled);

export default function App() {
  faLog('init');
  log('faLog');
  log2('faLogzzzzz');

  useEffect(() => {
    initAnalytics().catch((error) => console.error('Error initializing analytics:', error));
  }, []);

  // @ts-ignore
  return (
    <>
      <GlobalStyle />
      <Router basename={basePath || ''}>
        <RemoveTrailingSlash />
        <Routes>
          <Route path="/">
            <Route index element={<AuthIndicator />} />
            <Route path="login" element={<Login />} />
            <Route path="rpc" element={<RpcRoute />} />
            <Route path="create-account" element={<CreateAccount />} />
            <Route path="sign" element={<Sign />} />
            {/* TODO: This isn't available on mainnet, and isn't production ready, clean the code for production release */}
            {process.env.NETWORK_ID === 'testnet' && (
              <Route path="sign-multichain" element={<SignMultichain />} />
            )}
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="auth-callback" element={<AuthCallbackPage />} />
            <Route path="devices" element={<Devices />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          {/* <Route path="/home">
              <Route index element={<AuthIndicator />} />
          </Route> */}
        </Routes>
      </Router>
    </>
  );
}
