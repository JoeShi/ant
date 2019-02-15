// use localStorage to store the authority info, which might be sent from server in actual project.

import { Auth } from 'aws-amplify';
import { fetchPems, validatePems } from '@/utils/jwt';

export function getAuthority(str) {
  const awsAmplifyAccessTokenString = typeof str === 'undefined' ? localStorage.getItem('aws-amplify-access-token') : str;
  let authority;
  try {
    const accessToken = JSON.parse(awsAmplifyAccessTokenString);
    const { scope, exp } = accessToken;
    const now = Math.round(new Date() / 1000);
    if (exp > now) {
      authority = scope.split(' ');
    }
  } catch (e) {
    authority = awsAmplifyAccessTokenString;
  }

  if (typeof authority === 'string') {
    return [authority];
  }

  return authority || ['guest'];
}

export async function setAuthority(idToken, accessToken) {
  const config = Auth.configure();
  const { region, userPoolId } = config;
  const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const pems = await fetchPems(iss);
  const idTokenPayload = await validatePems(pems, idToken, iss);
  const accessTokenPayload = await validatePems(pems, accessToken, iss);

  const { scope } = accessTokenPayload;
  localStorage.setItem('aws-amplify-authority', JSON.stringify(scope.split(' ')));
  localStorage.setItem('aws-amplify-access-token', JSON.stringify(accessTokenPayload));
  localStorage.setItem('aws-amplify-id-token', JSON.stringify(idTokenPayload));
  console.log('set local storage done')
}




