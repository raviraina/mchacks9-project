import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div style={{ "text-align": "center" }} >
      <button onClick={() => loginWithRedirect()}>
        Log in/Sign up
      </button>
    </ div>
  )
};



export default Login;
