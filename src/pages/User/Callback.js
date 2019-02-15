import React, { Component } from 'react';
import { connect } from 'dva';
import queryString  from 'query-string';
import { reloadAuthorized } from '@/utils/Authorized';
import { routerRedux } from 'dva/router';

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class CallbackPage extends Component {

  componentDidMount() {
    // Amplify Auth will store session & user info in local storage. ONLY need to reload authority
    const { dispatch } = this.props;
    const params = queryString.parse(window.location.hash);

    reloadAuthorized();
    const urlParams = new URL(window.location.href);
    let redirect = params.state;
    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.substr(redirect.indexOf('#') + 1);
        }
      } else {
        window.location.href = redirect;
        return;
      }
    }
    dispatch(routerRedux.replace(redirect || '/'));
  }

  render() {
    return (
      <div />
    );
  }
}

export default CallbackPage;
