import React, { useState, useEffect } from "react";
import {
  getAllUsers,
  getSubscriptionStats,
  isSuperuser,
} from "../firebase/subscriptions";
import "./SuperuserDashboard.css";

const SuperuserDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  useEffect(() => {
    if (user && isSuperuser(user)) {
      loadDashboardData();
    } else {
      setError("Unauthorized access");
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getSubscriptionStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan =
      filterPlan === "all" || user.subscription.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.toDate()).toLocaleDateString();
  };

  const getStatusBadge = (subscription) => {
    if (subscription.plan === "premium" && subscription.status === "active") {
      return <span className="status-badge premium">Premium</span>;
    } else if (subscription.plan === "free") {
      return <span className="status-badge free">Free</span>;
    } else {
      return <span className="status-badge cancelled">Cancelled</span>;
    }
  };

  if (loading) {
    return (
      <div className="superuser-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superuser-dashboard">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="superuser-dashboard">
      <div className="dashboard-header">
        <h1>Superuser Dashboard</h1>
        <p>Manage users and monitor subscription analytics</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🆓</div>
            <div className="stat-content">
              <h3>{stats.freeUsers}</h3>
              <p>Free Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.premiumUsers}</h3>
              <p>Premium Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>{stats.totalProposals}</h3>
              <p>Total Proposals</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${stats.monthlyRevenue}</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-select">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="plan-filter"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Users</option>
            <option value="premium">Premium Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        <h2>Users ({filteredUsers.length})</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Proposals Used</th>
                <th>Joined Date</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData) => (
                <tr key={userData.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {userData.displayName?.charAt(0) ||
                          userData.email.charAt(0)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {userData.displayName || "No Name"}
                        </div>
                        <div className="user-profession">
                          {userData.profession || "No Profession"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{userData.email}</td>
                  <td>{getStatusBadge(userData.subscription)}</td>
                  <td>
                    <div className="usage-info">
                      {userData.subscription.proposalsLimit === -1 ? (
                        <span className="unlimited">Unlimited</span>
                      ) : (
                        <span className="limited">
                          {userData.subscription.proposalsUsed || 0} /{" "}
                          {userData.subscription.proposalsLimit || 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(userData.createdAt)}</td>
                  <td>{formatDate(userData.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="dashboard-actions">
        <button
          onClick={loadDashboardData}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};

export default SuperuserDashboard;
