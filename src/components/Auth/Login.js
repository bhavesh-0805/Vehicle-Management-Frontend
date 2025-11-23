import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import "./Login.css";
import logo from "../../assets/logo.png";


export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      onAuth(token);
      navigate("/home");
    } catch (err) {
      setError("❌ Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      {/* Logo Section */}
      <div className="logo-container">
        <a href="/"> <img src={logo} alt="AutoNexus Logo" className="dashboard-logo" /></a>
      </div>
      <div className="overlay">
        <div className="left-section">
          <h1>Trusted By Customers<br />For Over Two Decades</h1>
          Manage your vehicles, fuel, and maintenance efficiently.<br />
          Stay ahead with smarter tracking and insights.
        </div>

        <div className="right-section">
          <form onSubmit={handleSubmit} className="login-box">
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">
              ➜ Login
            </button>

            {error && <p className="error-msg">{error}</p>}

            <div className="bottom-links">
              <Link to="/register">New User? Register</Link>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
