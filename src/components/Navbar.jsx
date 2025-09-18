import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOutUser } from "../firebase/auth";
import { isSuperuser } from "../firebase/subscriptions";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <h1>📝 ProposeAI</h1>
        </Link>

        <div className="navbar-menu">
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
      </div>
    </nav>
  );
};

export default Navbar;
