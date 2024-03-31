import { baseEncode } from '@near-js/utils';

export const creatAuthToken = async (email: string) => {
  const signedMessage = await window.fastAuthController.signMessage(email);
  const encodedSignature = baseEncode(signedMessage.signature);
  const encodedPublicKey = baseEncode(signedMessage.publicKey.data);

  return {
    publicKey: encodedPublicKey,
    signature: encodedSignature,
  };
};

export const userSignup = async (email, accountId, setStatusMessage?) => {
  try {
    const { publicKey, signature } = await creatAuthToken(email);
    const response = await fetch('http://127.0.0.1:3010/auth/signup', {
      method:  'POST',
      mode:    'cors',
      headers: {
        'Content-Type':        'application/json',
        Authorization:         `Bearer ${signature}`,
        'X-Decentrailized-ID': `did:near:${accountId}`,
        'X-Public-Key':        publicKey,
      },
      body: JSON.stringify({
        email
      }),
    });

    if (!response.ok) {
      throw new Error('Signup request failed');
    }

    const result = await response.json();
    setStatusMessage?.('Signup successful!');
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    setStatusMessage?.('Signup failed.');
    throw error; // 상위 컴포넌트나 로직에서 에러를 처리할 수 있도록 에러를 던집니다.
  }
};

export const userLogin = async (email, accountId, setStatusMessage?) => {
  try {
    const { publicKey, signature } = await creatAuthToken(email);
    const response = await fetch('http://127.0.0.1:3010/auth/login', {
      method:  'POST',
      mode:    'cors',
      headers: {
        'Content-Type':        'application/json',
        Authorization:         `Bearer ${signature}`,
        'X-Decentrailized-ID': `did:near:${accountId}`,
        'X-Public-Key':        publicKey,
      },
      body: JSON.stringify({
        email
      }),
    });

    if (!response.ok) {
      throw new Error('Login request failed');
    }

    const result = await response.json();
    setStatusMessage?.('Login successful!');
    return result;
  } catch (error) {
    console.error('Login error:', error);
    setStatusMessage?.('Login failed.');
    throw error;
  }
};
