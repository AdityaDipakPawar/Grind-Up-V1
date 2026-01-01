import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import ApplicationTimeline from "../components/ApplicationTimeline";
import "../styles/ApplicationDetails.css";

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== "college") {
      navigate("/home");
      return;
    }

    const fetchApplicationDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/application/${applicationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setApplication(data.data.application);
        } else {
          setError(data.message || "Failed to fetch application details");
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
        setError("An error occurred while fetching application details");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [isAuthenticated, applicationId, navigate, user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "reviewing":
        return "status-reviewing";
      case "shortlisted":
        return "status-shortlisted";
      case "rejected":
        return "status-rejected";
      case "accepted":
        return "status-accepted";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!application) {
    return <div className="error">Application not found</div>;
  }

  return (
    <div className="application-details-container">
      <div className="application-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          Back to Home
        </button>
        <h1>Application Details</h1>
        <div className={`application-status ${getStatusClass(application.status)}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </div>
      </div>

      <div className="application-content">
        <div className="job-details-section">
          <h2>Job Details</h2>
          <div className="detail-card">
            <h3>{application.job.title}</h3>
            <p className="company-name">{application.job.company.companyName}</p>
            <div className="job-meta">
              <span>Location: {application.job.location.city}, {application.job.location.state}</span>
              <span>Job Type: {application.job.jobType}</span>
              {application.job.salary && <span>Salary: {application.job.salary}</span>}
            </div>
            <div className="job-description">
              <h4>Description</h4>
              <p>{application.job.description}</p>
            </div>
            {application.job.requiredSkills && application.job.requiredSkills.length > 0 && (
              <div className="skills-section">
                <h4>Required Skills</h4>
                <div className="skills-list">
                  {application.job.requiredSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ApplicationTimeline application={application} />

        <div className="application-details-section">
          <h2>Your Application</h2>
          <div className="detail-card">
            <div className="application-meta">
              <p>Applied on: {new Date(application.appliedAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(application.updatedAt).toLocaleDateString()}</p>
            </div>
            
            <div className="cover-letter-section">
              <h4>Cover Letter</h4>
              <p>{application.coverLetter || "No cover letter provided"}</p>
            </div>
            
            {application.resume && (
              <div className="resume-section">
                <h4>Resume</h4>
                <a href={application.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;