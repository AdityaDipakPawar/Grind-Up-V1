import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/home.css";

const PostJob = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    location: {
      city: "",
      state: "",
    },
    salary: "",
    jobType: "full-time",
    workMode: "onsite",
    category: "software",
    requiredSkills: "",
    applicationDeadline: "",
    vacancies: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.type !== "company") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!jobFormData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (jobFormData.title.length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    } else if (jobFormData.title.length > 200) {
      newErrors.title = "Job title must not exceed 200 characters";
    }

    // Description validation
    if (!jobFormData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (jobFormData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (jobFormData.description.length > 5000) {
      newErrors.description = "Description must not exceed 5000 characters";
    }

    // Location validation
    if (!jobFormData.location.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!jobFormData.location.state.trim()) {
      newErrors.state = "State is required";
    }

    // Category validation
    if (!jobFormData.category || !jobFormData.category.trim()) {
      newErrors.category = "Category is required";
    }

    // Vacancies validation
    if (jobFormData.vacancies < 1 || jobFormData.vacancies > 1000) {
      newErrors.vacancies = "Vacancies must be between 1 and 1000";
    }

    // Deadline validation (required and not in the past)
    if (!jobFormData.applicationDeadline) {
      newErrors.applicationDeadline = "Application deadline is required";
    } else {
      const deadline = new Date(jobFormData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        newErrors.applicationDeadline = "Deadline cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (name === "city" || name === "state") {
      setJobFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setJobFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.type !== "company") return;
    
    // Validate form before submitting
    if (!validateForm()) {
      setMessage("Please fix the errors before submitting");
      return;
    }
    
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        ...jobFormData,
        salary: jobFormData.salary ? {
          min: Number(jobFormData.salary),
          currency: 'INR',
          period: 'per-annum'
        } : null,
        requiredSkills: jobFormData.requiredSkills
          ? jobFormData.requiredSkills.split(",").map((skill) => skill.trim())
          : [],
        vacancies: Number(jobFormData.vacancies) || 1
      };
      
      console.log('=== Job Post Debug ===');
      console.log('User:', user);
      console.log('Form Data:', jobFormData);
      console.log('Payload to send:', JSON.stringify(payload, null, 2));
      console.log('Auth Token:', localStorage.getItem("authToken") ? 'Present' : 'Missing');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (data.success) {
        setMessage("Job posted successfully");
        setJobFormData({
          title: "",
          description: "",
          location: { city: "", state: "" },
          salary: "",
          jobType: "full-time",
          workMode: "onsite",
          requiredSkills: "",
          applicationDeadline: "",
          vacancies: 1,
        });
        // Redirect to home after 1 second with success state
        setTimeout(() => {
          navigate('/home', { state: { jobPosted: true } });
        }, 1000);
      } else {
        setMessage(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setMessage("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = user?.approvalStatus === "approved";

  return (
    <div className="home-page post-job-page">
      <main className="main-content main-auth">
        <div className="hero-section">
          <div className="job-form-container">
            <h2>Post a New Job</h2>
            {user && user.approvalStatus && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ffeaa7",
                  background: isApproved ? "#d4edda" : "#fff3cd",
                  color: isApproved ? "#155724" : "#856404",
                }}
              >
                {isApproved
                  ? "Your company is approved. You can post jobs."
                  : "Your company profile is not approved yet. You cannot post jobs until it is approved."}
              </div>
            )}

            <form onSubmit={handleJobFormSubmit} className="job-form">
              <div className="form-group">
                <label>Job Title <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="title"
                  value={jobFormData.title}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                  style={errors.title ? {borderColor: 'red'} : {}}
                  placeholder="e.g. Senior Software Engineer"
                />
                {errors.title && <small style={{color: 'red', fontSize: '12px'}}>{errors.title}</small>}
                <small style={{color: '#666', fontSize: '11px'}}>Min 3, Max 200 characters</small>
              </div>
              <div className="form-group">
                <label>Description <span style={{color: 'red'}}>*</span></label>
                <textarea
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                  style={errors.description ? {borderColor: 'red'} : {}}
                  placeholder="Provide detailed job description, responsibilities, and requirements..."
                  rows="6"
                />
                {errors.description && <small style={{color: 'red', fontSize: '12px'}}>{errors.description}</small>}
                <small style={{color: '#666', fontSize: '11px'}}>Min 20, Max 5000 characters ({jobFormData.description.length} / 5000)</small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={jobFormData.location.city}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                    style={errors.city ? {borderColor: 'red'} : {}}
                    placeholder="e.g. Mumbai"
                  />
                  {errors.city && <small style={{color: 'red', fontSize: '12px'}}>{errors.city}</small>}
                </div>
                <div className="form-group">
                  <label>State <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    name="state"
                    value={jobFormData.location.state}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                    style={errors.state ? {borderColor: 'red'} : {}}
                    placeholder="e.g. Maharashtra"
                  />
                  {errors.state && <small style={{color: 'red', fontSize: '12px'}}>{errors.state}</small>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary (Optional)</label>
                  <input
                    type="number"
                    name="salary"
                    value={jobFormData.salary}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                    placeholder="e.g. 500000"
                    min="0"
                  />
                  <small style={{color: '#666', fontSize: '11px'}}>Annual salary in INR</small>
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    name="jobType"
                    value={jobFormData.jobType}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category <span style={{color: 'red'}}>*</span></label>
                  <select
                    name="category"
                    value={jobFormData.category}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                    style={errors.category ? {borderColor: 'red'} : {}}
                  >
                    <option value="">Select category</option>
                    <option value="software">Software</option>
                    <option value="data">Data</option>
                    <option value="product">Product</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="hr">HR</option>
                    <option value="support">Customer Support</option>
                  </select>
                  {errors.category && <small style={{color: 'red', fontSize: '12px'}}>{errors.category}</small>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Work Mode</label>
                  <select
                    name="workMode"
                    value={jobFormData.workMode}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vacancies</label>
                  <input
                    type="number"
                    name="vacancies"
                    value={jobFormData.vacancies}
                    onChange={handleJobFormChange}
                    min="1"
                    max="1000"
                    disabled={!isApproved || submitting}
                    style={errors.vacancies ? {borderColor: 'red'} : {}}
                  />
                  {errors.vacancies && <small style={{color: 'red', fontSize: '12px'}}>{errors.vacancies}</small>}
                </div>
              </div>
              <div className="form-group">
                <label>Required Skills (Optional)</label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={jobFormData.requiredSkills}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                  placeholder="e.g. Java, React, Node.js, MongoDB"
                />
                <small style={{color: '#666', fontSize: '11px'}}>Enter skills separated by commas</small>
              </div>
              <div className="form-group">
                <label>Application Deadline <span style={{color: 'red'}}>*</span></label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={jobFormData.applicationDeadline}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                  style={errors.applicationDeadline ? {borderColor: 'red'} : {}}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.applicationDeadline && <small style={{color: 'red', fontSize: '12px'}}>{errors.applicationDeadline}</small>}
              </div>
              <button type="submit" className="submit-btn" disabled={!isApproved || submitting}>
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
            {message && <p style={{ marginTop: "12px", color: message.includes("success") ? "#155724" : "#c53030" }}>{message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostJob;
