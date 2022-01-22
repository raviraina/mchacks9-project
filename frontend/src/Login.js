import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { TitleBar } from "./Game";
import "./Game.css"

const Login = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className="whole-page">
      <div className="game-container">
        <TitleBar></TitleBar>
        <button className="login-button" onClick={() => loginWithRedirect()}>Log in/Sign up</button>
      </div>
    </div>
  );
};

export default Login;
