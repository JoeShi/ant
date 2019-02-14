// use localStorage to store the authority info, which might be sent from server in actual project.
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { Auth } from 'aws-amplify';
import request from '@/utils/request';

async function fetchPems(iss) {
  const body = await request(`${iss}/.well-known/jwks.json`, {credentials: 'omit'});
  const pems = {};
  const { keys } = body;
  for(let i = 0; i < keys.length; i += 1) {
    const keyId = keys[i].kid;
    const modulus = keys[i].n;
    const exponent = keys[i].e;
    const keyType = keys[i].kty;
    const jwk = { kty: keyType, n: modulus, e: exponent };
    pems[keyId] = jwkToPem(jwk);
  }
  return pems;
}

async function validatePems(pems, token, iss) {
  const decodedJwt = jwt.decode(token, {complete: true});
  if (!decodedJwt) {
    return new Error("Invalid JWT token")
  }

  if (decodedJwt.payload.iss !== iss) {
    return new Error("invalid issuer");
  }

  const { kid } = decodedJwt.header;
  const pem = pems[kid];
  if (!pem) {
    return new Error('no key found');
  }

  return jwt.verify(token, pem, { issuer: iss });
}

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
}




