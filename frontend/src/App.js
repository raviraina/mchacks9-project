import Game from './Game';
import './App.css';
import Login from './Login'
import AuthenticateTest from './AuthenticateTest';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="game" element={<Game />} />
          <Route path="test" element={<AuthenticateTest />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
