import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserProposals, deleteProposal } from "../firebase/proposals";
import {
  getUserSubscription,
  isSuperuser,
  syncProposalUsage,
} from "../firebase/subscriptions";
import {
  generatePDF,
  downloadPDF,
  exportHTML,
  exportText,
  exportMarkdown,
} from "../services/pdfService";
import { usePageTitle } from "../hooks/usePageTitle";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportDropdowns, setExportDropdowns] = useState({});
  const [deletingProposal, setDeletingProposal] = useState(null);
  const [subscription, setSubscription] = useState(null);

  usePageTitle("Dashboard");

  useEffect(() => {
    loadProposals();
    loadSubscription();
  }, [user]);

  // Refresh subscription data when proposals change
  useEffect(() => {
    if (proposals.length > 0) {
      loadSubscription();
    }
  }, [proposals.length]);

  // Close export dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".export-dropdown")) {
        setExportDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const userProposals = await getUserProposals(user.uid);
      setProposals(userProposals);

      // Sync usage count for free users
      if (subscription?.plan === "free") {
        await syncProposalUsage(user.uid, userProposals.length);
      }
    } catch (error) {
      setError("Failed to load proposals");
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadProposals(), loadSubscription()]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExportDropdown = (proposalId) => {
    setExportDropdowns((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

  const handleExportPDF = async (proposal) => {
    try {
      const pdfBlob = await generatePDF(proposal, proposal.content || "");
      downloadPDF(pdfBlob, `${proposal.title || "proposal"}.pdf`);
      setExportDropdowns((prev) => ({ ...prev, [proposal.id]: false }));
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const handleExportHTML = (proposal) => {
    exportHTML(proposal, proposal.content || "");
    setExportDropdowns((prev) => ({ ...prev, [proposal.id]: false }));
  };

  const handleExportText = (proposal) => {
    exportText(proposal, proposal.content || "");
    setExportDropdowns((prev) => ({ ...prev, [proposal.id]: false }));
  };

  const handleExportMarkdown = (proposal) => {
    exportMarkdown(proposal, proposal.content || "");
    setExportDropdowns((prev) => ({ ...prev, [proposal.id]: false }));
  };

  const handleDeleteProposal = async (proposalId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this proposal? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingProposal(proposalId);
      await deleteProposal(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setExportDropdowns((prev) => {
        const newState = { ...prev };
        delete newState[proposalId];
        return newState;
      });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      alert("Failed to delete proposal. Please try again.");
    } finally {
      setDeletingProposal(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user.displayName || "User"}!</h1>
          <p>Create and manage your professional proposals with AI</p>
          {subscription && (
            <div className="subscription-info">
              <div className={`plan-badge ${subscription.plan}`}>
                {subscription.plan === "premium" ? "⭐ Premium" : "🆓 Free"}
              </div>
              {subscription.plan === "free" && (
                <span
                  className={`usage-text ${
                    proposals.length >= (subscription.proposalsLimit || 3)
                      ? "usage-limit-reached"
                      : ""
                  }`}
                >
                  {Math.min(proposals.length, subscription.proposalsLimit || 3)}{" "}
                  / {subscription.proposalsLimit || 3} proposals used this month
                  {proposals.length >= (subscription.proposalsLimit || 3) && (
                    <span className="limit-warning"> ⚠️ Limit reached!</span>
                  )}
                </span>
              )}
              {subscription.plan === "premium" && (
                <span className="usage-text">Unlimited proposals</span>
              )}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            onClick={refreshData}
            className="refresh-btn"
            disabled={loading}
            title="Refresh data"
          >
            🔄
          </button>
          <Link to="/pricing" className="pricing-btn">
            {subscription?.plan === "free" ? "Upgrade" : "Manage Plan"}
          </Link>
          <Link to="/new-proposal" className="new-proposal-btn">
            <span className="plus-icon">+</span>
            New Proposal
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="proposals-section">
        <h2>Your Proposals</h2>

        {proposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No proposals yet</h3>
            <p>Create your first AI-powered proposal to get started</p>
            <Link to="/new-proposal" className="cta-button">
              Create Your First Proposal
            </Link>
          </div>
        ) : (
          <div className="proposals-grid">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-card">
                <div className="proposal-header">
                  <h3>{proposal.title || "Untitled Proposal"}</h3>
                  <span className="proposal-date">
                    {formatDate(proposal.updatedAt)}
                  </span>
                </div>

                <div className="proposal-meta">
                  <span className="client-name">
                    {proposal.clientName || "No client specified"}
                  </span>
                  <span className="proposal-type">
                    {proposal.template || "General"}
                  </span>
                </div>

                <div className="proposal-actions">
                  <Link
                    to={`/proposal/${proposal.id}`}
                    className="action-btn primary"
                  >
                    Edit
                  </Link>
                  <div className="export-dropdown">
                    <button
                      className="action-btn secondary"
                      onClick={() => toggleExportDropdown(proposal.id)}
                    >
                      Export
                    </button>
                    {exportDropdowns[proposal.id] && (
                      <div className="export-dropdown-menu">
                        <button
                          onClick={() => handleExportPDF(proposal)}
                          className="export-option"
                        >
                          📄 PDF Document
                        </button>
                        <button
                          onClick={() => handleExportHTML(proposal)}
                          className="export-option"
                        >
                          🌐 HTML File
                        </button>
                        <button
                          onClick={() => handleExportMarkdown(proposal)}
                          className="export-option"
                        >
                          📝 Markdown File
                        </button>
                        <button
                          onClick={() => handleExportText(proposal)}
                          className="export-option"
                        >
                          📄 Plain Text
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteProposal(proposal.id)}
                    disabled={deletingProposal === proposal.id}
                  >
                    {deletingProposal === proposal.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>{proposals.length}</h3>
          <p>Total Proposals</p>
        </div>
        <div className="stat-card">
          <h3>
            {
              proposals.filter((p) => {
                const date = p.updatedAt?.toDate
                  ? p.updatedAt.toDate()
                  : new Date(p.updatedAt);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length
            }
          </h3>
          <p>This Week</p>
        </div>
        <div className="stat-card">
          <h3>3</h3>
          <p>Free Uses Left</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
