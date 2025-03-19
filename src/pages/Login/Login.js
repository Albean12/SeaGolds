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

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    console.log("🔄 Attempting Login...");
  
    try {
      // ✅ Fetch CSRF Cookie if required (can be removed if CSRF is disabled)
      console.log("🟢 Fetching CSRF Cookie...");
      await axiosInstance.get('/sanctum/csrf-cookie');
  
      // ✅ Sending login request
      console.log("📤 Sending POST request to /api/login-admin-tenant");
      const response = await axiosInstance.post('/api/login-admin-tenant', {
        email,
        password,
      });
  
      const data = response.data;
      console.log("✅ Login Successful, Data:", data);
  
      // ✅ Ensure token is received before proceeding
      if (data.access_token) {
        try {
          // ✅ Store credentials in localStorage
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("user_id", data.user_id);
          console.log("✅ Token saved successfully:", data.access_token);
  
          // ✅ Apply token globally to axios for future requests
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
  
          // ✅ Debugging log to ensure role is stored properly
          console.log("🔍 Stored Role:", localStorage.getItem("role"));
          console.log("🔍 Stored User ID:", localStorage.getItem("user_id"));
  
          // ✅ Delay redirect to ensure token storage is successful
          setTimeout(() => {
            const role = localStorage.getItem("role");
            console.log("🚀 Redirecting based on role:", role);
  
            if (role === "admin") {
              window.location.href = "/admin/dashboard";
            } else if (role === "tenant") {
              window.location.href = "/tenant/dashboard/home";
            } else {
              console.error("❌ Unknown role! Redirecting to login.");
              setErrorMessage("Invalid role detected. Please try logging in again.");
            }
          }, 500);
        } catch (storageError) {
          console.error("❌ Error saving token:", storageError);
        }
      } else {
        console.error("❌ No access token received!");
        setErrorMessage("Invalid credentials or server error.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
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
