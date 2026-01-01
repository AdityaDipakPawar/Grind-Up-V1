import React, { useEffect, useState } from "react";
import "../styles/analytics.css";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Admin Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Total Colleges</h3>
            <p className="stat-number">{analytics.overview.totalColleges}</p>
            <span className="stat-badge">
              +{analytics.recent.colleges} this month
            </span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Companies</h3>
            <p className="stat-number">{analytics.overview.totalCompanies}</p>
            <span className="stat-badge">
              +{analytics.recent.companies} this month
            </span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Total Jobs</h3>
            <p className="stat-number">{analytics.overview.totalJobs}</p>
            <span className="stat-badge">
              +{analytics.recent.jobs} this month
            </span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Total Applications</h3>
            <p className="stat-number">
              {analytics.overview.totalApplications}
            </p>
            <span className="stat-badge">
              +{analytics.recent.applications} this month
            </span>
          </div>
        </div>
      </div>

      {/* Approval Status */}
      <div className="analytics-section">
        <h2>Approval Status</h2>
        <div className="approval-grid">
          <div className="approval-card">
            <h3>Colleges</h3>
            <div className="approval-stats">
              <div className="approval-stat">
                <span className="label">Pending</span>
                <span className="value pending">
                  {analytics.approvals.colleges.pending}
                </span>
              </div>
              <div className="approval-stat">
                <span className="label">Approved</span>
                <span className="value approved">
                  {analytics.approvals.colleges.approved}
                </span>
              </div>
              <div className="approval-stat">
                <span className="label">Rejected</span>
                <span className="value rejected">
                  {analytics.approvals.colleges.rejected}
                </span>
              </div>
            </div>
          </div>

          <div className="approval-card">
            <h3>Companies</h3>
            <div className="approval-stats">
              <div className="approval-stat">
                <span className="label">Pending</span>
                <span className="value pending">
                  {analytics.approvals.companies.pending}
                </span>
              </div>
              <div className="approval-stat">
                <span className="label">Approved</span>
                <span className="value approved">
                  {analytics.approvals.companies.approved}
                </span>
              </div>
              <div className="approval-stat">
                <span className="label">Rejected</span>
                <span className="value rejected">
                  {analytics.approvals.companies.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Breakdown */}
      <div className="analytics-section">
        <h2>Jobs Breakdown</h2>
        <div className="jobs-breakdown">
          <div className="breakdown-card">
            <h4>By Status</h4>
            <div className="breakdown-stats">
              <div className="breakdown-item">
                <span>Active Jobs</span>
                <strong>{analytics.jobs.active}</strong>
              </div>
              <div className="breakdown-item">
                <span>Closed Jobs</span>
                <strong>{analytics.jobs.closed}</strong>
              </div>
            </div>
          </div>

          <div className="breakdown-card">
            <h4>By Type</h4>
            <div className="breakdown-stats">
              {analytics.jobs.byType.map((type, index) => (
                <div key={index} className="breakdown-item">
                  <span>{type._id || "Unknown"}</span>
                  <strong>{type.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="analytics-section">
        <h2>Application Status Distribution</h2>
        <div className="application-status-grid">
          {Object.entries(analytics.applications.byStatus).map(
            ([status, count]) => (
              <div key={status} className="status-card">
                <h4>{status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                <p className="status-count">{count}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="analytics-section">
        <h2>Top Performers</h2>
        <div className="top-performers-grid">
          <div className="top-list">
            <h3>Top Companies by Job Postings</h3>
            {analytics.topCompanies.length > 0 ? (
              <ul>
                {analytics.topCompanies.map((company, index) => (
                  <li key={index}>
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{company.name}</span>
                    <span className="count">{company.jobCount} jobs</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No data available</p>
            )}
          </div>

          <div className="top-list">
            <h3>Most Applied Jobs</h3>
            {analytics.mostAppliedJobs.length > 0 ? (
              <ul>
                {analytics.mostAppliedJobs.map((job, index) => (
                  <li key={index}>
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{job.title}</span>
                    <span className="count">
                      {job.applicationCount} applications
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
