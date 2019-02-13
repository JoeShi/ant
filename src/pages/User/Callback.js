import React, { Component } from 'react';
import { connect } from 'dva';

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class CallbackPage extends Component {

  componentDidMount() {

  }

  render() {
    return (
      <div />
    );
  }
}

export default CallbackPage;
