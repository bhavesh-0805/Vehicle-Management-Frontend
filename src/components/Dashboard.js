import React from "react";
import "./Dashboard.css";
import { FaTools, FaChartLine, FaGasPump, FaParking } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* 🔵 Top Bar with Logo Left + Buttons Right */}
      <div className="dash-top-bar">
        <a href="/" className="logo-container">
          <img src={logo} alt="AutoNexus Logo" className="dashboard-logo" />
        </a>

        <div className="dash-buttons">
          <button className="dash-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="dash-btn" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>


      {/* ===== Hero Section ===== */}
      <header className="hero-section">
        <div className="overlay">
          <h1 className="hero-title">Drive with Confidence.</h1>
          <p className="hero-subtitle">
            Manage your vehicles, maintenance, and fuel tracking — all in one smart dashboard.
          </p>
        </div>
      </header>

      {/* ===== Features Section ===== */}
      <section className="features">
        <div className="feature-card">
          <FaTools className="feature-icon" />
          <h3>Maintenance Tracker</h3>
          <p>Schedule and track maintenance tasks easily and never miss a service.</p>
        </div>

        <div className="feature-card">
          <FaChartLine className="feature-icon" />
          <h3>Driver Behavior Analytics</h3>
          <p>Analyze driving patterns and gain insights into performance and safety.</p>
        </div>

        <div className="feature-card">
          <FaGasPump className="feature-icon" />
          <h3>Fuel & Expense Management</h3>
          <p>Track fuel consumption and monitor your expenses with real-time analytics.</p>
        </div>

        <div className="feature-card">
          <FaParking className="feature-icon" />
          <h3>Parking Assistance</h3>
          <p>Find, reserve, and manage your parking spaces efficiently.</p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <p>© 2025 AutoNexus | Designed by Bhavesh</p>
      </footer>
    </div>
  );
}
