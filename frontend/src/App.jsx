import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Dashboard/dashboard";
import Home from "./Home/home";
import Login from "./Authentication/Login/login";
import SignUp from "./Authentication/Register/signup";
import Dashboard from "./Dashboard/dashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element=
        {
        <ProtectedRoute>
        <Dashboard />
        </ProtectedRoute>
        } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
