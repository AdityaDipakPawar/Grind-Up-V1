import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/home.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
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

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/job-posts/${id}`);
        const data = await res.json();
        if (!data?.success) throw new Error(data?.message || "Failed to load job");
        setJob(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [apiBase, id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.type !== "college") {
      alert("Only college accounts can apply to jobs.");
      return;
    }
    try {
      setApplying(true);
      const res = await fetch(`${apiBase}/job-applications/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          coverLetter: "Interested in this position",
          resume: "resume_url_here",
        }),
      });
      const data = await res.json();
      if (data?.success) {
        alert("Application submitted successfully!");
        // Optionally navigate to applications
        // navigate("/my-applications");
      } else {
        alert(data?.message || "Failed to apply. Please try again.");
      }
    } catch (err) {
      alert("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="container"><p>Loading job details…</p></div>;
  if (error) return <div className="container"><p>Error: {error}</p></div>;
  if (!job) return <div className="container"><p>Job not found.</p></div>;

  const daysLeft = computeDaysLeft(job.applicationDeadline);

  return (
    <main className="main-content main-guest">
      <div className="container">
        <div className="welcome-banner" style={{ textAlign: "left" }}>
          <div className="welcome-content">
            <h1 style={{ marginBottom: 0 }}>{job.title}</h1>
            <p className="tagline" style={{ marginTop: 8 }}>
              {job.company?.companyName || "Company"} • {job.location?.city}, {job.location?.state}
            </p>

            <div className="value-proposition" style={{ marginTop: 24 }}>
              <h2 style={{ color: "#fff" }}>About the Role</h2>
              <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>
            </div>

            <div className="features-grid" style={{ marginTop: 10 }}>
              <div className="feature-card">
                <div className="feature-icon">🧭</div>
                <h3>Type & Mode</h3>
                <p>{job.jobType} • {job.workMode}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Compensation</h3>
                <p>
                  {job?.salary?.min || job?.salary?.max ? (
                    <>
                      {job.salary?.min ? `${job.salary.min}` : ""}
                      {job.salary?.max ? ` - ${job.salary.max}` : ""} {job.salary?.currency || "INR"}
                    </>
                  ) : (
                    "Not disclosed"
                  )}
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Deadline</h3>
                <p>
                  {formatDate(job.applicationDeadline)}
                  {typeof daysLeft === "number" ? ` • ${daysLeft} day(s) left` : ""}
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛠️</div>
                <h3>Required Skills</h3>
                <p>{Array.isArray(job.requiredSkills) ? job.requiredSkills.join(", ") : job.requiredSkills || "—"}</p>
              </div>
            </div>

            {job.requirements && (
              <div className="how-it-works">
                <h2>Requirements</h2>
                <p style={{ textAlign: "left", whiteSpace: "pre-line" }}>{job.requirements}</p>
              </div>
            )}

            {(Array.isArray(job.responsibilities) && job.responsibilities.length > 0) && (
              <div className="how-it-works">
                <h2>Responsibilities</h2>
                <ul style={{ textAlign: "left" }}>
                  {job.responsibilities.map((r, idx) => (<li key={idx}>{r}</li>))}
                </ul>
              </div>
            )}

            {(Array.isArray(job.qualifications) && job.qualifications.length > 0) && (
              <div className="how-it-works">
                <h2>Qualifications</h2>
                <ul style={{ textAlign: "left" }}>
                  {job.qualifications.map((q, idx) => (<li key={idx}>{q}</li>))}
                </ul>
              </div>
            )}

            <div className="cta-section">
              <h2>Ready to Apply?</h2>
              <div className="cta-buttons">
                <button className="cta-btn college-btn" onClick={handleApply} disabled={applying}>
                  {applying ? "Submitting…" : "Apply Now"}
                </button>
                <button className="cta-btn company-btn" onClick={() => navigate(-1)}>
                  Back
                </button>
              </div>
              {!isAuthenticated && (
                <p className="login-prompt">You’ll be asked to log in before applying.</p>
              )}
            </div>
          </div>
        </div>

        {job.company && (
          <div className="company-section" style={{ marginTop: 20 }}>
            <div className="section-header">
              <h2>About {job.company.companyName}</h2>
            </div>
            <p>Industry: {job.company.industry}</p>
            <p>Size: {job.company.companySize}</p>
            {job.company?.description && <p style={{ whiteSpace: "pre-line" }}>{job.company.description}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
