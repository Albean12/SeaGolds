import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import CreateAccountModal from '../CreateAccount/CreateAccount';
import axiosInstance from './axiosInstance';

const Login = () => {
  // State to manage modal, inputs, and errors
  const [isCreateAccountOpen, setCreateAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // ✅ Fixed this line

  // Open/Close Modal
  const openCreateAccountModal = () => setCreateAccountOpen(true);
  const closeCreateAccountModal = () => setCreateAccountOpen(false);

  // Helper function for fetch-based API calls
  const fetchWithAuth = async (url, method, body = null) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : null,
      });

      const text = await response.text(); // Log raw response
      console.log('Raw API Response:', text);

      return JSON.parse(text); // Parse JSON response
    } catch (error) {
      console.error('Error Parsing JSON:', error.message);
      throw error;
    }
  };

  // ✅ FIXED handleLogin Function
  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    console.log("🔄 Attempting Login..."); // Debugging

    try {
      // ✅ Get CSRF cookie from backend before making login request
      console.log("🟢 Fetching CSRF Cookie...");
      await axiosInstance.get('/sanctum/csrf-cookie');

      // ✅ Ensure login request is a POST request
      console.log("📤 Sending POST request to /api/login-admin-tenant");
      const response = await axiosInstance.post('/api/login-admin-tenant', {
        email,
        password,
      });

      const data = response.data;
      console.log("✅ Login Successful, Data:", data);

      // ✅ Store authentication tokens
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);

      // ✅ Redirect based on role (Admin or Tenant)
      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (data.role === "tenant") {
        window.location.href = "/tenant/dashboard/home";
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      // ✅ Improved error message handling
      if (error.response) {
        console.log("🔴 Error Response Data:", error.response.data);
        setErrorMessage(error.response.data.error || "Invalid credentials or CSRF issue.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="welcome-text">Hello, welcome!</h1>

        {/* Error Message Display */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="name@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>
          <div className="button-group">
            <button type="submit" className="login-button">
              Login
            </button>
          </div>
        </form>

        {/* Modal for Account Creation */}
        <div className="create-account">
          <span>
            You don't have an account?{' '}
            <span className="create-account-link" onClick={openCreateAccountModal}>
              Create now
            </span>
          </span>
        </div>

        {/* Social Links */}
        <div className="social-links">
          <span>FOLLOW</span>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="login-right"></div>

      {/* Create Account Modal */}
      <CreateAccountModal isOpen={isCreateAccountOpen} onClose={closeCreateAccountModal} />
    </div>
  );
};

export default Login;
