import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const AuthenticateTest = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();
    const fileSelectedHandler = event => {
        navigate("/game");
    }
    return (
        isAuthenticated && (
            <div>
                <h2>Welcome {user.name}</h2>
                <h3>Please upload a picture of your positive test</h3>
                <input type="file" onChange={fileSelectedHandler}></input>
            </div>
        )
    )
}

export default AuthenticateTest