import fetch from 'dva/fetch';
import Amplify, { Auth } from 'aws-amplify';

const oauthConfig = {
  // Domain name
  domain: 'accounts.joeshi.net',
  // Authorized scopes
  scope: [
    'phone',
    'email',
    'profile',
    'openid',
    'aws.cognito.signin.user.admin',
    'https://dl.joeshi.net/download.write',
    'https://dl.joeshi.net/download.read',
  ],

  // Callback URL
  redirectSignIn: 'http://localhost:8000/auth/callback/',

  // Sign out URL
  redirectSignOut: 'http://localhost:8000/auth/signout/',

  // 'code' for Authorization code grant,
  // 'token' for Implicit grant
  responseType: 'token',
};

Amplify.configure({
  Auth: {
    userPoolWebClientId: 'dn0f59hudaup7l85o0uq6nrh2',
    oauth: oauthConfig
  }
});

// Auth.configure(oauth);

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
    },
  },
};

let authRoutes = {};

function ergodicRoutes(routes, authKey, authority) {
  routes.forEach(element => {
    if (element.path === authKey) {
      if (!element.authority) element.authority = []; // eslint-disable-line
      Object.assign(element.authority, authority || []);
    } else if (element.routes) {
      ergodicRoutes(element.routes, authKey, authority);
    }
    return element;
  });
}

export function patchRoutes(routes) {
  Object.keys(authRoutes).map(authKey =>
    ergodicRoutes(routes, authKey, authRoutes[authKey].authority)
  );
  window.g_routes = routes;
}

export function render(oldRender) {
  fetch('/api/auth_routes')
    .then(res => res.json())
    .then(
      ret => {
        authRoutes = ret;
        oldRender();
      },
      () => {
        oldRender();
      }
    );
}
