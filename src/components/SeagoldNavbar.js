import React from 'react';
import { Link } from 'react-router-dom';
import './SeagoldNavbarCSS.css';

const SeagoldNavbar = () => {
  const logoUrl = `${process.env.REACT_APP_API_URL}/storage/icons/SeagoldLogo.svg`; // Update to your backend logo URL

  return (
    <div className="seagold-navbar-container">
      <div className="seagold-navbar">
        <div className="seagold-navbar-logo">
          <img src={logoUrl} alt="Seagold Dormitory Logo" />
          <span className="seagold-navbar-logo-text"></span> {/* Text beside the logo */}
        </div>
        <div className="seagold-navbar-links">
          <Link to="/" className="seagold-navbar-link">Home</Link>
          <Link to="/location" className="seagold-navbar-link">Location</Link>
          <Link to="/gallery" className="seagold-navbar-link">Gallery</Link>
          <Link to="/units" className="seagold-navbar-link">Units</Link>
          <Link to="/apply" className="seagold-navbar-link">Apply Now!</Link>
        </div>
        <div className="seagold-navbar-login">
          <Link to="/login" className="seagold-navbar-login-button">
            <span>Account</span>
            <img src="/user.png" alt="User Icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SeagoldNavbar;
