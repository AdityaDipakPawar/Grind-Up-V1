import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { jobPostsAPI, jobApplicationsAPI } from "../services/api";
import "../styles/JobDetails.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
};

const computeDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const deadline = new Date(dateStr);
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated && user?.type === "college") {
      checkApplicationStatus();
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (job) {
      fetchSimilarJobs();
    }
  }, [job]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobPostsAPI.getJobPostById(id);
      if (response?.success) {
        setJob(response.data);
      } else {
        throw new Error(response?.message || "Failed to load job");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await jobApplicationsAPI.getMyApplications();
      if (response?.success) {
        const applications = response.data?.applications || [];
        const applied = applications.some(
          (app) => app.job?._id === id || app.job === id
        );
        setHasApplied(applied);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  const fetchSimilarJobs = async () => {
    if (!job) return;
    
    setLoadingSimilar(true);
    try {
      // Fetch jobs from same category or same company, excluding current job
      const params = {
        category: job.category,
        limit: 4,
      };
      
      const response = await jobPostsAPI.getAllJobPosts(params);
      if (response?.success) {
        const jobs = response.data?.jobPosts || [];
        // Filter out current job and limit to 3
        const filtered = jobs
          .filter((j) => j._id !== id)
          .slice(0, 3);
        setSimilarJobs(filtered);
      }
    } catch (err) {
      console.error("Error fetching similar jobs:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!user || user?.type !== "college") {
      console.error("User type check failed:", {
        user,
        userType: user?.type,
        isAuthenticated,
        fullUser: user
      });
      alert(`Only college accounts can apply for jobs. Current user type: ${user?.type || 'unknown'}. Please log out and log back in.`);
      return;
    }

    if (hasApplied) {
      alert("You have already applied for this job.");
      return;
    }

    try {
      setApplying(true);
      const applicationData = {
        // Cover letter and resume are optional for college applications
        // Colleges apply on behalf of their students, not individual students
        coverLetter: "",
        resume: "",
      };

      const response = await jobApplicationsAPI.applyForJob(id, applicationData);
      if (response?.success) {
        alert("Application submitted successfully! You will receive a confirmation email shortly.");
        setHasApplied(true);
        // Optionally navigate to applications page
        // navigate("/job-applications");
      } else {
        alert(response?.message || "Failed to apply. Please try again.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to apply. Please try again.";
      alert(errorMsg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <div className="job-details-loading">
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="job-details-error">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="job-details-not-found">
            <p>Job not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = computeDaysLeft(job.applicationDeadline);
  const isDeadlinePassed = daysLeft !== null && daysLeft < 0;
  const canApply = !isDeadlinePassed && job.status === "active" && job.isActive;

  return (
    <div className="job-details-page">
      <div className="job-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Jobs
        </button>

        {/* Main Job Details Card */}
        <div className="job-details-card">
          <div className="job-header-section">
            <h1 className="job-title">{job.title}</h1>
            <div className="job-meta-top">
              <a
                href="#company-section"
                className="company-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("company-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {job.company?.companyName || "Company"}
              </a>
              <span className="job-badge">{job.jobType}</span>
              {job.location && (
                <div className="location-info">
                  📍 {job.location.city}, {job.location.state}
                </div>
              )}
            </div>

            <div className="job-meta-grid">
              {job.workMode && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">💼</div>
                  <div className="job-meta-content">
                    <h4>Work Mode</h4>
                    <p>{job.workMode.charAt(0).toUpperCase() + job.workMode.slice(1)}</p>
                  </div>
                </div>
              )}

              {job.salary && (job.salary.min || job.salary.max) && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">💰</div>
                  <div className="job-meta-content">
                    <h4>Salary</h4>
                    <p>
                      {job.salary.min ? `₹${job.salary.min.toLocaleString()}` : ""}
                      {job.salary.min && job.salary.max ? " - " : ""}
                      {job.salary.max ? `₹${job.salary.max.toLocaleString()}` : ""}
                      {job.salary.period ? ` ${job.salary.period.replace("-", " ")}` : ""}
                      {job.salary.isNegotiable && " (Negotiable)"}
                    </p>
                  </div>
                </div>
              )}

              {job.experience && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">🎯</div>
                  <div className="job-meta-content">
                    <h4>Experience</h4>
                    <p>
                      {job.experience.level
                        ? job.experience.level.charAt(0).toUpperCase() + job.experience.level.slice(1).replace("-", " ")
                        : job.experience.min || "0"}
                      {job.experience.min && job.experience.max ? ` - ${job.experience.max} years` : job.experience.min ? " years" : ""}
                    </p>
                  </div>
                </div>
              )}

              {job.applicationDeadline && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">📅</div>
                  <div className="job-meta-content">
                    <h4>Application Deadline</h4>
                    <p>
                      {formatDate(job.applicationDeadline)}
                      {typeof daysLeft === "number" && (
                        <span style={{ display: "block", marginTop: "5px", fontWeight: "600", color: daysLeft < 0 ? "#d32f2f" : daysLeft <= 7 ? "#fff8f4" : "#1976d2" }}>
                          {daysLeft < 0
                            ? "Deadline passed"
                            : daysLeft === 0
                            ? "Last day to apply"
                            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {job.vacancies && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">👥</div>
                  <div className="job-meta-content">
                    <h4>Vacancies</h4>
                    <p>{job.vacancies} position{job.vacancies !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              )}

              {job.category && (
                <div className="job-meta-item">
                  <div className="job-meta-icon">📂</div>
                  <div className="job-meta-content">
                    <h4>Category</h4>
                    <p>{job.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="job-section">
              <h2 className="job-section-title">Job Description</h2>
              <div className="job-section-content">{job.description}</div>
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Required Skills</h2>
              <div className="skills-container">
                {job.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="skill-tag required">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Skills */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Preferred Skills</h2>
              <div className="skills-container">
                {job.preferredSkills.map((skill, idx) => (
                  <span key={idx} className="skill-tag preferred">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="job-section">
              <h2 className="job-section-title">Requirements</h2>
              <div className="job-section-content">{job.requirements}</div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Responsibilities</h2>
              <ul className="job-section-list">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Qualifications</h2>
              <ul className="job-section-list">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Benefits</h2>
              <ul className="job-section-list">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Instructions */}
          {job.applicationInstructions && (
            <div className="job-section">
              <h2 className="job-section-title">How to Apply</h2>
              <div className="job-section-content">{job.applicationInstructions}</div>
            </div>
          )}

          {/* Apply Section */}
          <div className="apply-section">
            <h2>Ready to Apply?</h2>
            {!canApply ? (
              <p style={{ marginBottom: "20px" }}>
                {isDeadlinePassed
                  ? "The application deadline for this job has passed."
                  : "This job is currently not accepting applications."}
              </p>
            ) : (
              <>
                <p style={{ marginBottom: "20px" }}>
                  {hasApplied
                    ? "You have already applied for this position. Check your applications for updates."
                    : "Click the button below to submit your application for this position."}
                </p>
                <div className="apply-buttons">
                  {!hasApplied && (
                    <button
                      className="apply-btn-primary"
                      onClick={handleApply}
                      disabled={applying || !canApply}
                    >
                      {applying ? "Submitting Application..." : "Apply Now"}
                    </button>
                  )}
                  <button className="apply-btn-secondary" onClick={() => navigate("/jobs")}>
                    Browse More Jobs
                  </button>
                </div>
                {!isAuthenticated && (
                  <p className="login-prompt">You'll be asked to log in before applying.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Company Section */}
        {job.company && (
          <div id="company-section" className="company-section">
            <div className="company-header">
              <div className="company-logo-placeholder">
                {job.company.companyName?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="company-info">
                <h2>{job.company.companyName}</h2>
                {job.company.industry && <p>Industry: {job.company.industry}</p>}
                {job.company.companySize && <p>Size: {job.company.companySize}</p>}
              </div>
            </div>

            <div className="company-details-grid">
              {job.company.email && (
                <div className="company-detail-item">
                  <strong>Email:</strong>
                  <span>
                    <a href={`mailto:${job.company.email}`} style={{ color: "#ff914d" }}>
                      {job.company.email}
                    </a>
                  </span>
                </div>
              )}
              {job.company.contactNo && (
                <div className="company-detail-item">
                  <strong>Contact:</strong>
                  <span>{job.company.contactNo}</span>
                </div>
              )}
              {job.company.location && (
                <div className="company-detail-item">
                  <strong>Location:</strong>
                  <span>{job.company.location}</span>
                </div>
              )}
            </div>

            {job.company.description && (
              <div className="company-description">{job.company.description}</div>
            )}

            <div className="company-links">
              {job.company.companyWebsite && (
                <a
                  href={job.company.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-link-btn"
                >
                  🌐 Website
                </a>
              )}
              {job.company.linkedinProfile && (
                <a
                  href={job.company.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-link-btn"
                >
                  💼 LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* Similar Jobs Section */}
        {similarJobs.length > 0 && (
          <div className="similar-jobs-section">
            <h2 className="job-section-title">Similar Jobs</h2>
            {loadingSimilar ? (
              <p>Loading similar jobs...</p>
            ) : (
              <div className="similar-jobs-grid">
                {similarJobs.map((similarJob) => (
                  <a
                    key={similarJob._id}
                    href={`/jobs/${similarJob._id}`}
                    className="similar-job-card"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/jobs/${similarJob._id}`);
                    }}
                  >
                    <h3>{similarJob.title}</h3>
                    <span className="company-name">
                      {similarJob.company?.companyName || "Company"}
                    </span>
                    <p className="job-description">
                      {similarJob.shortDescription ||
                        similarJob.description?.substring(0, 150) + "..."}
                    </p>
                    <div className="job-meta">
                      {similarJob.location && (
                        <span>
                          📍 {similarJob.location.city}, {similarJob.location.state}
                        </span>
                      )}
                      {similarJob.workMode && <span>💼 {similarJob.workMode}</span>}
                      {similarJob.salary?.min && (
                        <span>💰 ₹{similarJob.salary.min.toLocaleString()}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
