import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import request from '@/utils/request';

export async function fetchPems(iss) {
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

export async function validatePems(pems, token, iss) {
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
