import fetch from 'dva/fetch';
import Amplify, { Hub, Logger, Auth } from 'aws-amplify';

const alex = new Logger('Alexander_the_auth_watcher');

alex.onHubCapsule = (capsule) => {

  switch (capsule.payload.event) {

    case 'signIn':
      console.log(capsule.payload);
      alex.error('user signed in'); // [ERROR] Alexander_the_auth_watcher - user signed in
      break;
    case 'signUp':
      alex.error('user signed up');
      break;
    case 'signOut':
      alex.error('user signed out');
      break;
    case 'signIn_failure':
      alex.error('user sign in failed');
      break;
    case 'configured':
      alex.error('the Auth module is configured');
      break;
    default:
      alex.log('hehe');
  }
};

Hub.listen('auth', alex);



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
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-west-2:2cd991f0-596f-48e5-aaba-5e171405f9cf',

    // REQUIRED - Amazon Cognito Region
    region: 'us-west-2',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-west-2_r0k5rfBa5',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string
    userPoolWebClientId: 'dn0f59hudaup7l85o0uq6nrh2',

    oauth: oauthConfig
  },
  Analytics: {
    AWSPinpoint: {
      // Amazon Pinpoint App Client ID
      appId: '6257afa9b43c41d6a3375a2204c6305a',

      // Amazon service region
      region: 'us-east-1'
    }
  }
});

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
