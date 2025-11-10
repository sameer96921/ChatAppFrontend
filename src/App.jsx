import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ChatLayout from "./pages/ChatLayout";
const App = () => {
  return (
    <div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>}></Route>
          <Route path="/sign-up" element={<SignUp/>}></Route>
          <Route path="/message" element={<ChatLayout/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
