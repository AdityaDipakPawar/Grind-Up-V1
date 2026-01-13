import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts';
import { useNavigate } from 'react-router-dom';
import './invite.css';

const Invite = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [invites, setInvites] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  
  // New state for enhancements
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.type === 'company') {
      fetchColleges();
      fetchMyJobs();
      fetchSentInvites();
    } else if (user?.type === 'college') {
      fetchCollegeInvites();
    }
  }, [isAuthenticated, user]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/colleges?limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        setColleges([]);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // Handle both response structures
        const collegesList = data.data?.colleges || data.data || [];
        console.log(`Fetched ${collegesList.length} colleges:`, collegesList);
        setColleges(collegesList);
        if (collegesList.length === 0) {
          console.warn("No colleges found in the database. Make sure colleges are registered.");
        }
      } else {
        console.error("Failed to fetch colleges:", data.message);
        setColleges([]);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-posts/company`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyJobs(data.data.jobPosts || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchSentInvites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/company`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const fetchCollegeInvites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/college`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (collegeId) => {
    if (!selectedJob) {
      alert("Please select a job first");
      return;
    }

    setSendingInvite(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          collegeId,
          jobId: selectedJob,
          message: inviteMessage || undefined
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite sent successfully!");
        fetchSentInvites();
        fetchColleges(); // Refresh to update status indicators
        setInviteMessage('');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invite. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to accept this invitation? This will automatically create a job application.")) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite accepted successfully! Your application has been submitted.");
        fetchCollegeInvites();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert("Failed to accept invite. Please try again.");
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to decline this invitation?")) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/${inviteId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite declined");
        fetchCollegeInvites();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error declining invite:", error);
      alert("Failed to decline invite. Please try again.");
    }
  };

  // Check if college has already been invited for selected job
  const isCollegeInvited = (collegeId) => {
    if (!selectedJob) return false;
    return invites.some(invite => 
      invite.college?._id === collegeId || invite.college === collegeId
    ) && invites.some(invite => 
      (invite.college?._id === collegeId || invite.college === collegeId) && 
      (invite.job?._id === selectedJob || invite.job === selectedJob)
    );
  };

  // Get invite status for a college
  const getCollegeInviteStatus = (collegeId) => {
    if (!selectedJob) return null;
    const invite = invites.find(inv => 
      (inv.college?._id === collegeId || inv.college === collegeId) && 
      (inv.job?._id === selectedJob || inv.job === selectedJob)
    );
    return invite ? invite.status : null;
  };

  // Filter colleges by search term
  const filteredColleges = colleges.filter(college => {
    if (!collegeSearchTerm) return true;
    const searchLower = collegeSearchTerm.toLowerCase();
    return (
      college.collegeName?.toLowerCase().includes(searchLower) ||
      college.collegeCity?.toLowerCase().includes(searchLower) ||
      college.email?.toLowerCase().includes(searchLower) ||
      college.universityAffiliation?.toLowerCase().includes(searchLower) ||
      college.contactNo?.includes(searchLower)
    );
  });

  // Filter invites by status
  const filteredInvites = invites.filter(invite => {
    if (statusFilter === 'all') return true;
    return invite.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="container">
        <main>
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Company view - Show colleges list
  if (user?.type === 'company') {
    const selectedJobData = myJobs.find(job => job._id === selectedJob);
    
    return (
      <div className="container">
        <main>
          <div className="invite-header">
            <h2>Send Invitations to Colleges</h2>
            <div className="job-selector">
              <label>Select Job for Invitation:</label>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="">-- Select a Job --</option>
                {myJobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              {selectedJobData && (
                <div className="selected-job-info">
                  <p><strong>Job:</strong> {selectedJobData.title}</p>
                  <p><strong>Location:</strong> {selectedJobData.location?.city}, {selectedJobData.location?.state}</p>
                </div>
              )}
            </div>
          </div>

          {selectedJob && (
            <div className="message-input-section">
              <label>Optional Message (will be included with invitation):</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personalized message for the college..."
                rows="3"
                className="invite-message-input"
              />
            </div>
          )}

          {/* Second Row: Two Columns */}
          <div className="colleges-grid">
            <div className="colleges-list-section">
              <div className="colleges-header">
                <h3>Registered Colleges ({filteredColleges.length})</h3>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search colleges by name, location, email..."
                    value={collegeSearchTerm}
                    onChange={(e) => setCollegeSearchTerm(e.target.value)}
                    className="college-search-input"
                  />
                </div>
              </div>
              {colleges.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏫</div>
                  <h3>No Colleges Found</h3>
                  <p>No colleges are registered on the platform yet.</p>
                  <p className="empty-hint">Colleges need to register first before they can receive invitations.</p>
                </div>
              ) : filteredColleges.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No Colleges Match Your Search</h3>
                  <p>Try adjusting your search terms.</p>
                </div>
              ) : (
                <div className="colleges-list">
                  {filteredColleges.map(college => {
                  const inviteStatus = getCollegeInviteStatus(college._id);
                  const isInvited = isCollegeInvited(college._id);
                  
                  return (
                    <div 
                      key={college._id} 
                      className={`college-card ${isInvited ? 'already-invited' : ''}`}
                    >
                      <div className="college-info">
                        <div className="college-header-row">
                          <h4>{college.collegeName}</h4>
                          <div className="college-badges">
                            {college.approvalStatus && (
                              <span className={`approval-status-badge status-${college.approvalStatus}`}>
                                {college.approvalStatus === 'pending' ? 'Pending Approval' : 
                                 college.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                              </span>
                            )}
                            {isInvited && (
                              <span className={`invite-status-badge status-${inviteStatus}`}>
                                {inviteStatus === 'pending' ? 'Invited' : inviteStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        {college.collegeCity && (
                          <p><strong>Location:</strong> {college.collegeCity}</p>
                        )}
                        <p><strong>Email:</strong> {college.email}</p>
                        {college.contactNo && <p><strong>Contact:</strong> {college.contactNo}</p>}
                        {college.universityAffiliation && <p><strong>University:</strong> {college.universityAffiliation}</p>}
                        {college.tpoName && <p><strong>TPO:</strong> {college.tpoName}</p>}
                      </div>
                      <button 
                        className={`send-invite-btn ${isInvited ? 'invited' : ''}`}
                        onClick={() => handleSendInvite(college._id)}
                        disabled={!selectedJob || sendingInvite || isInvited}
                        title={isInvited ? 'Invitation already sent to this college' : ''}
                      >
                        {sendingInvite ? 'Sending...' : 
                         isInvited ? 'Invited' : 
                         'Send Invite'}
                      </button>
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            <div className="sent-invites-section">
            <div className="section-header-with-filter">
              <h3>Sent Invitations ({invites.length})</h3>
              {invites.length > 0 && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              )}
            </div>
            {invites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📨</div>
                <h3>No Invitations Sent Yet</h3>
                <p>Start inviting colleges to apply for your job postings.</p>
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No Invitations Match This Filter</h3>
                <p>Try selecting a different status filter.</p>
              </div>
            ) : (
              <div className="invites-list">
                {filteredInvites.map(invite => (
                  <div key={invite._id} className="invite-item">
                    <div className="invite-item-header">
                      <div className="invite-main-info">
                        <div className="college-icon">🏫</div>
                        <div className="invite-details">
                          <h4 className="college-name">{invite.college?.collegeName || 'Unknown College'}</h4>
                          <p className="job-title">{invite.job?.title || 'Job Title Not Available'}</p>
                        </div>
                      </div>
                      <span className={`status-badge status-${invite.status}`}>
                        {invite.status === 'pending' ? '⏳ Pending' : 
                         invite.status === 'accepted' ? '✓ Accepted' : 
                         '✗ Declined'}
                      </span>
                    </div>
                    <div className="invite-content">
                      {invite.job?.location && (
                        <div className="info-row">
                          <span className="info-icon">📍</span>
                          <span className="info-text">
                            {invite.job.location.city || 'N/A'}, {invite.job.location.state || 'N/A'}
                          </span>
                        </div>
                      )}
                      {invite.message && (
                        <div className="invite-message">
                          <div className="message-header">
                            <span className="message-icon">💬</span>
                            <strong>Personal Message:</strong>
                          </div>
                          <p className="message-text">{invite.message}</p>
                        </div>
                      )}
                      <div className="invite-footer">
                        <div className="invite-date">
                          <span className="date-icon">📅</span>
                          <span>Sent on {new Date(invite.invitedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        {invite.status === 'accepted' && (
                          <div className="success-indicator">
                            <span className="success-icon">✓</span>
                            <span>Application Submitted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // College view - Show received invites
  return (
    <div className="container">
      <main>
        <div className="invite-header">
          <div className="section-title">
            <h3>Placement Invites</h3>
            {invites.length > 0 && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            )}
          </div>
        </div>
        <div className="invite-grid">
          {invites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📬</div>
              <h3>No Invitations Received Yet</h3>
              <p>Companies will send you invitations to apply for their job postings.</p>
              <p className="empty-hint">Keep your profile updated to receive more invitations!</p>
            </div>
          ) : filteredInvites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Invitations Match This Filter</h3>
              <p>Try selecting a different status filter.</p>
            </div>
          ) : (
            filteredInvites.map(invite => (
              <div key={invite._id} className="invite-card">
                <div className="company-header">
                  <div className="company-logo">
                    <span>🏢</span>
                  </div>
                  <div>
                    <h4>{invite.company?.companyName || 'Company'}</h4>
                    <span className={`status-badge status-${invite.status}`}>
                      {invite.status}
                    </span>
                  </div>
                </div>
                <div className="job-details">
                  <div className="detail-item">
                    <span className="label">Role:</span>
                    <span className="value">{invite.job?.title || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">
                      {invite.job?.location?.city || 'N/A'}, {invite.job?.location?.state || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Employment type:</span>
                    <span className="value">{invite.job?.employmentType || invite.job?.jobType || 'N/A'}</span>
                  </div>
                  {invite.job?.salary && (
                    <div className="detail-item">
                      <span className="label">Salary:</span>
                      <span className="value">
                        ₹{invite.job.salary.min?.toLocaleString('en-IN')} 
                        {invite.job.salary.max ? ` - ₹${invite.job.salary.max.toLocaleString('en-IN')}` : ''} 
                        {invite.job.salary.period ? ` ${invite.job.salary.period}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{invite.job?.description?.substring(0, 150) || invite.job?.shortDescription || 'No description available'}...</span>
                  </div>
                  {invite.message && (
                    <div className="detail-item message-item">
                      <span className="label">Company Message:</span>
                      <span className="value">{invite.message}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Invited On:</span>
                    <span className="value">{new Date(invite.invitedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {invite.status === 'pending' && (
                  <div className="action-buttons">
                    <button className="accept-btn" onClick={() => handleAcceptInvite(invite._id)}>
                      ✓ Accept & Apply
                    </button>
                    <button className="ignore-btn" onClick={() => handleDeclineInvite(invite._id)}>
                      ✗ Decline
                    </button>
                  </div>
                )}
                {invite.status === 'accepted' && (
                  <div className="accepted-message">
                    <p>✓ You have accepted this invitation and your application has been submitted.</p>
                    <button 
                      className="view-application-btn"
                      onClick={() => navigate('/applied-jobs')}
                    >
                      View My Applications
                    </button>
                  </div>
                )}
                {invite.status === 'declined' && (
                  <div className="declined-message">
                    <p>You have declined this invitation.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Invite;
