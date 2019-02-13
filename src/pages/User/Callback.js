import React, { Component } from 'react';
// import { connect } from 'dva';
import { Auth } from 'aws-amplify';

// @connect(({ login, loading }) => ({
//   login,
//   submitting: loading.effects['login/login'],
// }))
class CallbackPage extends Component {

  componentDidMount() {
    const config = Auth.configure();
    const {domain, redirectSignIn, responseType} = config.oauth;
    const clientId = config.userPoolWebClientId;
    const url = `https://${domain}/login?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
    window.location.assign(url);
  }

  render() {
    return (
      <div />
    );
  }
}

export default CallbackPage;
