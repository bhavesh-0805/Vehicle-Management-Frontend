import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import { setAuthToken } from "./api";
import "./App.css";
import Home from "./components/home/Home.js";
import VehicleInfo from "./components/home/VehicleInfo";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/vehicle/:id" element={<VehicleInfo />} />

          <Route
            path="/login"
            element={
              <Login
                onAuth={(t) => {
                  setToken(t);
                  localStorage.setItem("token", t);
                }}
              />
            }
          />

          <Route
            path="/register"
            element={
              <Register
                onAuth={(t) => {
                  setToken(t);
                  localStorage.setItem("token", t);
                }}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
