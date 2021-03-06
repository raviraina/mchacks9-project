import "./Game.css";
import React, { useEffect } from "react";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

const options = [
  {
    id: 1,
    src: "/mask.png",
    type: "rock",
  },
  {
    id: 2,
    src: "/vaccine.png",
    type: "paper",
  },
  {
    id: 3,
    src: "/omicron.png",
    type: "scissor",
  },
];

export const TitleBar = () => {
  return (
    <div className="title-bar">
      <QuestionIcon></QuestionIcon>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1 className="title-bar-title">ROCK PAPER COVID</h1>
      </div>
      <div>
        <StatsIcon></StatsIcon>
        <SettingsIcon></SettingsIcon>
      </div>
    </div>
  );
};

const Game = () => {
  const { user, isAuthenticated } = useAuth0();
  const [selection, setSelection] = useState(undefined);
  const [socket, setSocket] = useState(null);
  const [isInGame, setIsInGame] = useState(false);
  const [roomdID, setRoomID] = useState(null);
  const [playerNum, setPlayerNum] = useState(0);
  const [result, setResult] = useState(null);
  const [pressedJoinGame, setPressedJoinGame] = useState(false);
  const [opponent, setOppenent] = useState(null);

  const resultFinder = () => {
    console.log(window.localStorage.getItem("player"));
  };

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    newSocket.on("disconnect", ()=>{
      setPlayerNum(null);
      setRoomID(null);
      setIsInGame(false);
      setSelection(undefined);
      setPressedJoinGame(false);
      
    })
    newSocket.on("room-created", (roomId) => {
      console.log("first player: " + roomId);
      setPlayerNum(1);
      setRoomID(roomId);
    });
    newSocket.on("player-2-connected", (player) => {
      console.log("player 2 connected, with id: " + player);
      setOppenent(player);
      setIsInGame(true);
      newSocket.broadcast.emit("player-opp", user.name);
    });
    newSocket.on("room-joined", (roomId) => {
      console.log("second player: " + roomId);
      setRoomID(roomId);
      setPlayerNum(2);
    });
    newSocket.on("player-opp", (player) => {
      console.log("player oppenent thing");
      setOppenent(player);
    });
    // results listeners
    newSocket.on("player-1-wins", () => {
      console.log(
        "player 1 wins, heres your id: " + window.localStorage.getItem("player")
      );
      if (window.localStorage.getItem("player") === "1") {
        setResult("You Won!");
      } else {
        setResult("You Lost!");
      }

      setPlayerNum(null);
      setRoomID(null);
      setIsInGame(false);
      setSelection(undefined);
      setPressedJoinGame(false);
    });
    newSocket.on("player-2-wins", () => {
      console.log(
        "player 2 wins, heres your id: " + window.localStorage.getItem("player")
      );
      if (window.localStorage.getItem("player") === "2") {
        setResult("You Won!");
      } else {
        setResult("You Lost!");
      }
      setPlayerNum(null);
      setRoomID(null);
      setIsInGame(false);
      setSelection(undefined);
      setPressedJoinGame(false);
    });
    newSocket.on("draw", () => {
      console.log("draw");
      setResult("Draw");

      setPlayerNum(null);
      setRoomID(null);
      setIsInGame(false);
      setSelection(undefined);
      setPressedJoinGame(false);
    });
    return () => newSocket.close();
  }, []);

  const requestToJoinGame = () => {
    setPressedJoinGame(true);
    socket.emit("createJoinRoom", user.name);
  };

  const onOptionSelect = (id) => {
    if (isInGame === false) {
      return 0;
    }
    setSelection(id);
    const choice = options.filter((item) => item.id === id)[0].type;
    const data = {
      userId: user.name,
      playerId: playerNum,
      myChoice: choice,
      roomId: roomdID,
    };
    window.localStorage.setItem("player", playerNum);
    console.log(JSON.stringify(data));
    socket.emit("make-move", data);
  };

  if (isAuthenticated) {
    return (
      <div className="whole-page">
        <div className="game-container">
          <TitleBar></TitleBar>
          <div className="player-display">
            {isInGame && (
              <>
                <div className="player-info">
                  <img
                    className="profile-pic"
                    src="/default-player-icon.jpeg"
                    alt="opponent profile pic"
                  ></img>
                  <h2 className="username">
                    {opponent ? opponent : "Other Player"}
                  </h2>
                </div>
                <div className="player-info">
                  <img
                    className="profile-pic"
                    src={
                      user.picture ? user.picture : "/default-player-icon.jpeg"
                    }
                    alt="profile pic"
                  ></img>
                  <h2 className="username">
                    {" "}
                    {user.name ? user.name : "You"}{" "}
                  </h2>
                </div>
              </>
            )}
            {!pressedJoinGame && result && <div>{result}</div>}
            {pressedJoinGame && !isInGame && (
              <div>Waiting for opponent... </div>
            )}
            {!pressedJoinGame && (
              <button
                className="login-button"
                style={{ padding: "20px" }}
                onClick={() => requestToJoinGame()}
              >
                Join Game
              </button>
            )}
          </div>
          <div className="options-menu">
            {options.map((item) => {
              return (
                <Option
                  id={item.id}
                  key={item.id}
                  src={item.src}
                  setSelection={onOptionSelect}
                  selection={selection}
                ></Option>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    return <div className="container">please login</div>;
  }
};

const Option = ({ src, id, setSelection, selection }) => {
  return (
    <div
      className={"option " + (id === selection ? " selected-option" : "")}
      onClick={() => setSelection(id)}
    >
      <img
        className="option-image"
        src={src}
        width={100}
        height={100}
        alt=""
      ></img>
    </div>
  );
};

const SettingsIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        fill="var(--color-tone-3)"
        d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
      ></path>
    </svg>
  );
};

const StatsIcon = () => {
  const navigate = useNavigate();
  const selectStats = (event) => {
    navigate("/");
  };
  return (
    <button style={{"textDecoration": "none"}} onClick={selectStats}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <path
          fill="var(--color-tone-3)"
          d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"
        ></path>
      </svg>
    </button>
  );
};
const QuestionIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };
  return (
    <button onClick={togglePopup}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <path
          fill="var(--color-tone-3)"
          d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
        ></path>
      </svg>

      {isOpen && (
        <Popup
          content={
            <>
              <p>Vaccine Beats Face Mask </p>
              <p>Omicron Beats Vaccine</p>
              <p>Face Mask Beats Omicron</p>
            </>
          }
          handleClose={togglePopup}
        />
      )}
    </button>
  );
};

//const StatsIcon = () => {
//return (
//<svg
//xmlns="http://www.w3.org/2000/svg"
//height="24"
//viewBox="0 0 24 24"
//width="24"
//>
//<path
//fill="var(--color-tone-3)"
//d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"
//></path>
//</svg>
//);
//};
//const QuestionIcon = () => {
//return (
//<svg
//xmlns="http://www.w3.org/2000/svg"
//height="24"
//viewBox="0 0 24 24"
//width="24"
//>
//<path
//fill="var(--color-tone-3)"
//d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
//></path>
//</svg>
//);
//};

export default Game;
