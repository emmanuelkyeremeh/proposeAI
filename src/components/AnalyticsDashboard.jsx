import React, { useState, useEffect } from "react";
import { getUserProposals } from "../firebase/proposals";
import { getUserSubscription } from "../firebase/subscriptions";
import "./AnalyticsDashboard.css";

const AnalyticsDashboard = ({ user }) => {
  const [proposals, setProposals] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    loadData();
  }, [user, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [proposalsData, subscriptionData] = await Promise.all([
        getUserProposals(user.uid),
        getUserSubscription(user.uid),
      ]);
      setProposals(proposalsData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProposals = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return proposals.filter((proposal) => {
      const proposalDate = proposal.createdAt?.toDate
        ? proposal.createdAt.toDate()
        : new Date(proposal.createdAt);
      return proposalDate >= cutoffDate;
    });
  };

  const getAnalytics = () => {
    const filteredProposals = getFilteredProposals();

    // Calculate metrics
    const totalProposals = filteredProposals.length;
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const thisMonthProposals = filteredProposals.filter((proposal) => {
      const proposalDate = proposal.createdAt?.toDate
        ? proposal.createdAt.toDate()
        : new Date(proposal.createdAt);
      return proposalDate >= thisMonth;
    }).length;

    // Template usage
    const templateUsage = {};
    filteredProposals.forEach((proposal) => {
      const template = proposal.template || "general";
      templateUsage[template] = (templateUsage[template] || 0) + 1;
    });

    // Client analysis
    const clientCount = new Set(filteredProposals.map((p) => p.clientName))
      .size;

    // Average content length
    const avgContentLength =
      filteredProposals.length > 0
        ? Math.round(
            filteredProposals.reduce(
              (sum, p) => sum + (p.content?.length || 0),
              0
            ) / filteredProposals.length
          )
        : 0;

    return {
      totalProposals,
      thisMonthProposals,
      templateUsage,
      clientCount,
      avgContentLength,
      recentProposals: filteredProposals.slice(0, 5),
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.plan !== "premium") {
    return (
      <div className="analytics-dashboard">
        <div className="upgrade-prompt">
          <h2>Analytics Dashboard</h2>
          <p>This feature is available for Premium users only.</p>
          <a href="/pricing" className="upgrade-btn">
            Upgrade to Premium
          </a>
        </div>
      </div>
    );
  }

  const analytics = getAnalytics();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>{analytics.totalProposals}</h3>
            <p>Total Proposals</p>
            <span className="metric-subtitle">Last {timeRange} days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>{analytics.thisMonthProposals}</h3>
            <p>This Month</p>
            <span className="metric-subtitle">Current month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{analytics.clientCount}</h3>
            <p>Unique Clients</p>
            <span className="metric-subtitle">Different clients</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <h3>{analytics.avgContentLength}</h3>
            <p>Avg. Content Length</p>
            <span className="metric-subtitle">Characters per proposal</span>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {/* Template Usage Chart */}
        <div className="chart-section">
          <h2>Template Usage</h2>
          <div className="template-usage">
            {Object.entries(analytics.templateUsage).map(
              ([template, count]) => (
                <div key={template} className="template-item">
                  <div className="template-name">
                    {template.charAt(0).toUpperCase() +
                      template.slice(1).replace("-", " ")}
                  </div>
                  <div className="template-bar">
                    <div
                      className="template-fill"
                      style={{
                        width: `${(count / analytics.totalProposals) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="template-count">{count}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="recent-section">
          <h2>Recent Proposals</h2>
          <div className="recent-proposals">
            {analytics.recentProposals.map((proposal) => (
              <div key={proposal.id} className="recent-proposal">
                <div className="proposal-info">
                  <h4>{proposal.title || "Untitled Proposal"}</h4>
                  <p className="proposal-client">
                    {proposal.clientName || "No client"}
                  </p>
                  <p className="proposal-date">
                    {formatDate(proposal.createdAt)}
                  </p>
                </div>
                <div className="proposal-stats">
                  <span className="template-badge">
                    {proposal.template || "general"}
                  </span>
                  <span className="content-length">
                    {proposal.content?.length || 0} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
