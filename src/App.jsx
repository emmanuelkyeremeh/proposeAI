import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChange } from "./firebase/auth";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProposalEditor from "./components/ProposalEditor";
import NewProposal from "./components/NewProposal";
import PricingPage from "./components/PricingPage";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SuperuserDashboard from "./components/SuperuserDashboard";
import Footer from "./components/Footer";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ProposeAI...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} />}
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/dashboard"
              element={
                user ? <Dashboard user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/new-proposal"
              element={
                user ? <NewProposal user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/proposal/:id"
              element={
                user ? <ProposalEditor user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/pricing"
              element={
                user ? <PricingPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/analytics"
              element={
                user ? (
                  <AnalyticsDashboard user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                user ? (
                  <SuperuserDashboard user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
