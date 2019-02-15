// use localStorage to store the authority info, which might be sent from server in actual project.

import { Auth } from 'aws-amplify';

export function getAuthority() {
  const config = Auth.configure();
  const { userPoolWebClientId } = config;
  const sub = localStorage.getItem(`CognitoIdentityServiceProvider.${userPoolWebClientId}.LastAuthUser`);
  const scope = localStorage.getItem(`CognitoIdentityServiceProvider.${userPoolWebClientId}.${sub}.tokenScopesString`);
  let authority;

  try {
    authority = scope.split(' ');
    if (typeof authority === 'string') {
      return [authority];
    }
  } catch (e) {
    return ['guest']
  }

  return authority || ['guest'];
}


export function setAuthority(authority) {
  localStorage.setItem('pro-authority', JSON.stringify(authority));
}

