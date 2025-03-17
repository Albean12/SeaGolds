import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Use navigate instead of window.location.href
import './Login.css';
import CreateAccountModal from '../CreateAccount/CreateAccount';
import axiosInstance from './axiosInstance';

const Login = () => {
  // State to manage modal, inputs, and errors
  const [isCreateAccountOpen, setCreateAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // ✅ Use navigate() for programmatic navigation

  // Open/Close Modal
  const openCreateAccountModal = () => setCreateAccountOpen(true);
  const closeCreateAccountModal = () => setCreateAccountOpen(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      // ✅ Fetch CSRF token once
      await axiosInstance.get('/sanctum/csrf-cookie');

      // ✅ Perform login explicitly via axios
      const response = await axiosInstance.post('/api/login-admin-tenant', {
        email,
        password,
      });

      const data = response.data;

      // ✅ Set localStorage tokens
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);

      // ✅ Redirect user based on role
      if (data.role === "admin") {
        navigate("/admin/dashboard"); // ✅ Uses React Router's navigate
      } else if (data.role === "tenant") {
        navigate("/tenant/dashboard/home");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 419) {
        setErrorMessage("Session expired. Please refresh the page and try again.");
      } else {
        setErrorMessage(error.response?.data?.error || "Invalid credentials or CSRF issue.");
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
