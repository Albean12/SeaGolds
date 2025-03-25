import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SeagoldNavbarCSS.css';

const SeagoldNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`seagold-navbar-container ${scrolled ? 'scrolled' : ''}`}>
      <div className="seagold-navbar">
        {/* Logo Section */}
        <div className="seagold-navbar-logo">
          <Link to="/" onClick={closeMobileMenu}>
            <img 
              src="/seagoldlogo.jpg" // Changed to absolute path
              alt="Seagold Dormitory Logo"
              loading="lazy" // Better performance
            />
          </Link>
          <span className="seagold-navbar-logo-text"></span>
        </div>

        {/* Desktop Navigation */}
        <div className={`seagold-navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
          <NavLink to="/location" onClick={closeMobileMenu}>Location</NavLink>
          <NavLink to="/gallery" onClick={closeMobileMenu}>Gallery</NavLink>
          <NavLink to="/units" onClick={closeMobileMenu}>Units</NavLink>
          <NavLink to="/apply" onClick={closeMobileMenu}>Apply Now!</NavLink>
        </div>

        {/* Login Section */}
        <div className="seagold-navbar-login">
          <Link 
            to="/login" 
            className="seagold-navbar-login-button"
            onClick={closeMobileMenu}
          >
            <span>Account</span>
            <img 
              src="/user.png" 
              alt="User Icon" 
              loading="lazy" // Better performance
            />
          </Link>
        </div>

        {/* Mobile Menu Button (Hidden on desktop) */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <span className="close-icon">×</span>
          ) : (
            <span className="hamburger-icon">☰</span>
          )}
        </button>
      </div>
    </div>
  );
};

// Reusable NavLink component for consistent styling
const NavLink = ({ to, onClick, children }) => (
  <Link 
    to={to} 
    className="seagold-navbar-link" 
    onClick={onClick}
  >
    {children}
  </Link>
);

export default SeagoldNavbar;