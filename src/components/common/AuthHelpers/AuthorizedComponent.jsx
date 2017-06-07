import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const AuthorizedComponent = props => (
  <div>
    {props.isLoggedIn ? (
      <div>{props.children}</div>
      ) : '' }
  </div>
    );

AuthorizedComponent.propTypes = {
  children: PropTypes.element,
  isLoggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
  isLoggedIn: state.auth.isLoggedIn,
});

export default connect(mapStateToProps)(AuthorizedComponent);