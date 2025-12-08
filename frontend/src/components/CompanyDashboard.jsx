import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const CompanyDashboard = () => {
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
      const response = await axios.get('/api/dashboard/company', {
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
        <h1>Company Dashboard</h1>
        <div className="company-info">
          <h2>{dashboardData.company.name}</h2>
          <p>{dashboardData.company.email}</p>
          <p>{dashboardData.company.industry} | {dashboardData.company.size} employees</p>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalCollegesReached}</div>
          <div className="metric-label">Colleges Reached</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalJobPostings}</div>
          <div className="metric-label">Active Job Postings</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalPositions}</div>
          <div className="metric-label">Total Positions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dashboardData.metrics.totalApplications}</div>
          <div className="metric-label">Total Applications</div>
        </div>
      </div>

      {/* Job Posts Statistics */}
      <div className="dashboard-section">
        <h3>Job Postings Overview</h3>
        <div className="posts-stats">
          <div className="stat-item">
            <span className="stat-label">Approved:</span>
            <span className="stat-value">{dashboardData.metrics.jobPosts.approved || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">{dashboardData.metrics.jobPosts.pending || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rejected:</span>
            <span className="stat-value declined">{dashboardData.metrics.jobPosts.rejected || 0}</span>
          </div>
        </div>
      </div>

      {/* Active Job Posts */}
      <div className="dashboard-section">
        <h3>Active Job Openings</h3>
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Positions</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Posted</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.activeJobs.length > 0 ? (
                dashboardData.activeJobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.positions}</td>
                    <td>{job.salary || 'Negotiable'}</td>
                    <td>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.postedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No active job postings</td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Recent Applications */}
      <div className="dashboard-section">
        <h3>Recent Applications</h3>
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>College</th>
                <th>Job Position</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentApplications.length > 0 ? (
                dashboardData.recentApplications.map(app => (
                  <tr key={app.id}>
                    <td>{app.college || 'N/A'}</td>
                    <td>{app.job || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No applications yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Colleges */}
      <div className="dashboard-section">
        <h3>Top Colleges by Applications</h3>
        <div className="trending-list">
          {dashboardData.topColleges.length > 0 ? (
            dashboardData.topColleges.map((college, index) => (
              <div key={college.id} className="trending-item">
                <div className="rank">{index + 1}</div>
                <div className="college-name">{college.name}</div>
                <div className="applications-count">{college.applications} applications</div>
              </div>
            ))
          ) : (
            <p className="no-data">No college applications yet</p>
          )}
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
    </div>
  );
};

export default CompanyDashboard;
