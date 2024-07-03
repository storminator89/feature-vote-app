// src/components/Login.js
import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

function Login({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaSignInAlt className="login-icon" />
          <h2>Welcome to Feature Ideas</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="register-link">
          Don't have an account?{' '}
          <button onClick={onRegisterClick}>Register</button>
        </p>
      </div>
    </div>
  );
}

export default Login;