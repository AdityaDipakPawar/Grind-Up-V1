import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const CollegeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/college', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="error-message">No dashboard data available</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>College Dashboard</h1>
        <div className="college-info">
          <h2>{dashboardData.college.name}</h2>
          <p>{dashboardData.college.email}</p>
          <p>{dashboardData.college.city}</p>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalCompanies}</div>
          <div className="metric-label">Companies Engaged</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.activeJobOpenings}</div>
          <div className="metric-label">Active Job Openings</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalApplications}</div>
          <div className="metric-label">Total Applications</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.college.avgCTC || 'N/A'}</div>
          <div className="metric-label">Average CTC</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.college.placementPercent || 'N/A'}%</div>
          <div className="metric-label">Placement %</div>
        </div>
      </div>

      {/* Invites Statistics */}
      <div className="dashboard-section">
        <h3>Invites Overview</h3>
        <div className="invites-stats">
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">{dashboardData.metrics.invites.pending || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accepted:</span>
            <span className="stat-value accepted">{dashboardData.metrics.invites.accepted || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Declined:</span>
            <span className="stat-value declined">{dashboardData.metrics.invites.declined || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Invites */}
      <div className="dashboard-section">
        <h3>Recent Invites</h3>
        <div className="invites-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Title</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentInvites.length > 0 ? (
                dashboardData.recentInvites.map(invite => (
                  <tr key={invite.id}>
                    <td>{invite.company || 'N/A'}</td>
                    <td>{invite.job || 'N/A'}</td>
                    <td>{invite.salary || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${invite.status}`}>
                        {invite.status}
                      </span>
                    </td>
                    <td>{new Date(invite.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No invites yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Companies */}
      <div className="dashboard-section">
        <h3>Top Companies by Invites</h3>
        <div className="trending-list">
          {dashboardData.trendingCompanies.length > 0 ? (
            dashboardData.trendingCompanies.map((company, index) => (
              <div key={company.id} className="trending-item">
                <div className="rank">{index + 1}</div>
                <div className="company-name">{company.name}</div>
                <div className="invites-count">{company.invites} invites</div>
              </div>
            ))
          ) : (
            <p className="no-data">No trending companies yet</p>
          )}
        </div>
      </div>

      {/* Applications Statistics */}
      <div className="dashboard-section">
        <h3>Applications Overview</h3>
        <div className="applications-stats">
          {Object.entries(dashboardData.metrics.applications).length > 0 ? (
            Object.entries(dashboardData.metrics.applications).map(([status, count]) => (
              <div key={status} className="stat-item">
                <span className="stat-label">{status}:</span>
                <span className="stat-value">{count}</span>
              </div>
            ))
          ) : (
            <p className="no-data">No applications yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
