import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import './register.css'; // separate CSS so login stays untouched
import logo from '../../assets/logo.png'

export default function Register({ onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.token);
      navigate('/');
    } catch {
      setMsg('❌ Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      {/* Logo Section */}
            <div className="logo-container">
              <a href="/"> <img src={logo} alt="AutoNexus Logo" className="dashboard-logo" /></a>
            </div>
      {/* ===== Left Section (same as login) ===== */}
      <div className="register-left">
        <h1>Trusted By Customers<br />For Over Two Decades</h1>
        <p>
          Manage your vehicles, fuel, and maintenance efficiently.<br />
          Stay ahead with smarter tracking and insights.
        </p>
      </div>

      {/* ===== Right Section (form card) ===== */}
      <div className="register-right">
        <div className="register-box">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn">→ Register</button>
          </form>

          {msg && <p className="error">{msg}</p>}

          <div className="register-footer">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
