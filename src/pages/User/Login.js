import React, { Component } from 'react';
import { connect } from 'dva';
import queryString  from 'query-string'
import { Auth } from 'aws-amplify';

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {

  componentDidMount() {
    const callbackUri = queryString.parse(window.location.search).callback_uri;
    const config = Auth.configure();
    const {domain, redirectSignIn, responseType} = config.oauth;

    const clientId = config.userPoolWebClientId;
    let url = `https://${domain}/login?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    try {
      const redirectUrlParams = new URL(callbackUri);  // eslint-disable-line
      url = `${url}&state=${callbackUri}`
    } finally {
      window.location.assign(url);
    }
  }

  render() {
    return (
      <div />
    );
  }
}

export default LoginPage;
