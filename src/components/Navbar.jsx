import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOutUser } from "../firebase/auth";
import { isSuperuser } from "../firebase/subscriptions";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <h1>📝 ProposeAI</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/new-proposal" className="navbar-link">
            New Proposal
          </Link>
          <Link to="/pricing" className="navbar-link">
            Pricing
          </Link>
          <Link to="/analytics" className="navbar-link">
            Analytics
          </Link>
          {isSuperuser(user) && (
            <Link to="/admin" className="navbar-link admin-link">
              Admin Dashboard
            </Link>
          )}

          <div className="navbar-user">
            <span className="user-name">{user.displayName || user.email}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
          <Link
            to="/dashboard"
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/new-proposal"
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            New Proposal
          </Link>
          <Link to="/pricing" className="mobile-link" onClick={closeMobileMenu}>
            Pricing
          </Link>
          <Link
            to="/analytics"
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            Analytics
          </Link>
          {isSuperuser(user) && (
            <Link
              to="/admin"
              className="mobile-link admin-link"
              onClick={closeMobileMenu}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="mobile-user">
            <span className="user-name">{user.displayName || user.email}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
