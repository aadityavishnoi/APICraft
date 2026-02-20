import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home/home";
import Login from "./Authentication/Login/login";
import SignUp from "./Authentication/Register/signup";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
