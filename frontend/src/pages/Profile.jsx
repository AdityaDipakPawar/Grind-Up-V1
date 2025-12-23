import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { profileAPI, authAPI } from '../services/api.js';
import '../styles/Profile.css';

const Profile = () => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [placementFile, setPlacementFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const loadProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        // console.log('Profile API response:', res);
        if (res.success) {
          setFormData(res.data || {});
          setOriginalData(res.data || {});
          
          // Update user context with approvalStatus from profile if available
          if (res.data?.approvalStatus && user) {
            updateUser({
              ...user,
              approvalStatus: res.data.approvalStatus
            });
          }
        } else {
          setMessage(res.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Profile load error:', error);
        setMessage('Failed to load profile: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlacementFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/x-xlsx',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setMessage('Please select a valid Excel file (.xls, .xlsx)');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must not exceed 5MB');
        return;
      }

      setPlacementFile(file);
      setMessage('');
    }
  };

  // Define required fields based on user type
  const getMandatoryFields = () => {
    if (user?.type === 'college') {
      return ['collegeName', 'contactNo', 'collegeCity', 'grade', 'tpoName', 'tpoContactNo', 'universityAffiliation', 'courses', 'numStudents', 'highestCGPA', 'avgCTC', 'avgPlaced', 'placementPercent', 'placementRecordUrl'];
    } else {
      return ['companyName', 'contactNo', 'industry', 'companySize', 'location', 'recruiterName', 'recruiterEmail', 'companyBio', 'yearsOfExperience'];
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const mandatoryFields = getMandatoryFields();

    mandatoryFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabels = {
          collegeName: 'College Name',
          contactNo: 'Contact No',
          collegeCity: 'City',
          grade: 'Grade',
          tpoName: 'TPO Name',
          tpoContactNo: 'TPO Contact No',
          universityAffiliation: 'University Affiliation',
          courses: 'Courses',
          numStudents: 'Number of Students',
          highestCGPA: 'Highest CGPA',
          avgCTC: 'Average CTC',
          avgPlaced: 'Average Placed',
          placementPercent: 'Placement Percent',
          placementRecordUrl: 'Placement Records',
          companyName: 'Company Name',
          industry: 'Industry',
          companySize: 'Company Size',
          location: 'Location',
          recruiterName: 'Recruiter Name',
          recruiterEmail: 'Recruiter Email',
          companyBio: 'Company Bio',
          yearsOfExperience: 'Years of Experience',
        };
        errors[field] = `${fieldLabels[field] || field} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if any mandatory field has changed
  const hasNewData = () => {
    const mandatoryFields = getMandatoryFields();
    return mandatoryFields.some((field) => formData[field] !== originalData[field]);
  };

  const handleUploadPlacementRecords = async () => {
    if (!placementFile) {
      setMessage('Please select a file first');
      return;
    }

    setUploadingFile(true);
    setMessage('');
    try {
      // Log for debugging
      console.log('File to upload:', placementFile);
      console.log('File name:', placementFile.name);
      console.log('File type:', placementFile.type);
      console.log('File size:', placementFile.size);

      const res = await profileAPI.uploadPlacementRecords(placementFile);
      if (res.success) {
        setMessage('Placement records uploaded successfully');
        setPlacementFile(null);
        setFormData((prev) => ({
          ...prev,
          placementRecordUrl: res.data.placementRecordUrl,
          placementRecordUploadedAt: res.data.placementRecordUploadedAt,
        }));
        // Reset file input
        const fileInput = document.getElementById('placementRecordInput');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(res.message || 'Failed to upload placement records');
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      setMessage('Failed to upload: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeletePlacementRecords = async () => {
    if (!window.confirm('Are you sure you want to delete the placement records?')) {
      return;
    }

    setMessage('');
    try {
      const res = await profileAPI.deletePlacementRecords();
      if (res.success) {
        setMessage('Placement records deleted successfully');
        setFormData((prev) => ({
          ...prev,
          placementRecordUrl: null,
          placementRecordUploadedAt: null,
        }));
      } else {
        setMessage(res.message || 'Failed to delete placement records');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setValidationErrors({});

    // Check if any new data has been entered
    if (!hasNewData()) {
      setMessage('Please enter new data in at least one mandatory field to save');
      return;
    }

    // Validate form
    if (!validateForm()) {
      setMessage('Please fill all mandatory fields');
      return;
    }

    try {
      const res = await profileAPI.updateProfile(formData);
      if (res.success) {
        setMessage('Profile updated successfully');
        setFormData(res.data);
        setOriginalData(res.data);
        
        // Update user context with new profile completion status
        // Fetch latest user data to get updated profileComplete flag
        const currentUserData = await authAPI.getCurrentUser();
        if (currentUserData && currentUserData.user) {
          updateUser(currentUserData.user);
        }
      } else {
        setMessage(res.message || 'Update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Update failed');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  const isCollege = (user?.type === 'college');

  const getApprovalStatusBanner = () => {
    const approvalStatus = formData.approvalStatus || user?.approvalStatus || 'pending';
    
    if (approvalStatus === 'approved') {
      return (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          <strong>Your {isCollege ? 'college' : 'company'} profile has been approved by the admin.</strong>
        </div>
      );
    } else if (approvalStatus === 'rejected') {
      return (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✗</span>
          <strong>Your {isCollege ? 'college' : 'company'} profile has been rejected. Please contact admin for more information.</strong>
        </div>
      );
    } else {
      return (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <strong>Your {isCollege ? 'college' : 'company'} profile is pending admin approval.</strong>
        </div>
      );
    }
  };

  return (
    <div className="container">
      <div style={{ padding: 20, paddingBottom: 0 }}>
        <h2>Profile</h2>
        {getApprovalStatusBanner()}
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {isCollege ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>College Name <span style={{ color: 'red' }}>*</span></label>
                <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
                {validationErrors.collegeName && <span className="error-text">{validationErrors.collegeName}</span>}
              </div>
              <div className="form-group">
                <label>Contact No <span style={{ color: 'red' }}>*</span></label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
                {validationErrors.contactNo && <span className="error-text">{validationErrors.contactNo}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City <span style={{ color: 'red' }}>*</span></label>
                <input name="collegeCity" value={formData.collegeCity || ''} onChange={handleChange} />
                {validationErrors.collegeCity && <span className="error-text">{validationErrors.collegeCity}</span>}
              </div>
              <div className="form-group">
                <label>Grade <span style={{ color: 'red' }}>*</span></label>
                <input name="grade" value={formData.grade || ''} onChange={handleChange} />
                {validationErrors.grade && <span className="error-text">{validationErrors.grade}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>TPO Name <span style={{ color: 'red' }}>*</span></label>
                <input name="tpoName" value={formData.tpoName || ''} onChange={handleChange} />
                {validationErrors.tpoName && <span className="error-text">{validationErrors.tpoName}</span>}
              </div>
              <div className="form-group">
                <label>TPO Contact No <span style={{ color: 'red' }}>*</span></label>
                <input name="tpoContactNo" value={formData.tpoContactNo || ''} onChange={handleChange} />
                {validationErrors.tpoContactNo && <span className="error-text">{validationErrors.tpoContactNo}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>University Affiliation <span style={{ color: 'red' }}>*</span></label>
                <input name="universityAffiliation" value={formData.universityAffiliation || ''} onChange={handleChange} />
                {validationErrors.universityAffiliation && <span className="error-text">{validationErrors.universityAffiliation}</span>}
              </div>
              <div className="form-group">
                <label>Courses <span style={{ color: 'red' }}>*</span></label>
                <input name="courses" value={formData.courses || ''} onChange={handleChange} />
                {validationErrors.courses && <span className="error-text">{validationErrors.courses}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Students <span style={{ color: 'red' }}>*</span></label>
                <input name="numStudents" type="number" value={formData.numStudents || ''} onChange={handleChange} />
                {validationErrors.numStudents && <span className="error-text">{validationErrors.numStudents}</span>}
              </div>
              <div className="form-group">
                <label>Highest CGPA <span style={{ color: 'red' }}>*</span></label>
                <input name="highestCGPA" type='number' value={formData.highestCGPA || ''} onChange={handleChange} />
                {validationErrors.highestCGPA && <span className="error-text">{validationErrors.highestCGPA}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average CTC <span style={{ color: 'red' }}>*</span></label>
                <input name="avgCTC" type='number' value={formData.avgCTC || ''} onChange={handleChange} />
                {validationErrors.avgCTC && <span className="error-text">{validationErrors.avgCTC}</span>}
              </div>
              <div className="form-group">
                <label>Average Placed <span style={{ color: 'red' }}>*</span></label>
                <input name="avgPlaced" type="number" value={formData.avgPlaced || ''} onChange={handleChange} />
                {validationErrors.avgPlaced && <span className="error-text">{validationErrors.avgPlaced}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Placement Percent <span style={{ color: 'red' }}>*</span></label>
                <input name="placementPercent" type='number' value={formData.placementPercent || ''} onChange={handleChange} />
                {validationErrors.placementPercent && <span className="error-text">{validationErrors.placementPercent}</span>}
              </div>
            </div>

            {/* Placement Records Section */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
              <h3 style={{ marginBottom: '15px' }}>Last 3 Years Placement Records <span style={{ color: 'red' }}>*</span></h3>
              <div className="form-group">
                <label>Upload Excel Sheet (.xls, .xlsx) - Max 5MB <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="placementRecordInput"
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  onChange={handlePlacementFileChange}
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                />
              </div>
              
              {placementFile && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <p><strong>Selected file:</strong> {placementFile.name}</p>
                  <button
                    type="button"
                    onClick={handleUploadPlacementRecords}
                    disabled={uploadingFile}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploadingFile ? 'not-allowed' : 'pointer',
                      opacity: uploadingFile ? 0.7 : 1,
                    }}
                  >
                    {uploadingFile ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              )}

              {formData.placementRecordUrl && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', border: '1px solid #4CAF50' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>✓ Placement records uploaded</strong>
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                    Uploaded: {new Date(formData.placementRecordUploadedAt).toLocaleDateString()}
                  </p>
                  <a
                    href={formData.placementRecordUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      marginRight: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Download File
                  </a>
                  <button
                    type="button"
                    onClick={handleDeletePlacementRecords}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9em',
                    }}
                  >
                    Delete File
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name <span style={{ color: 'red' }}>*</span></label>
                <input name="companyName" value={formData.companyName || ''} onChange={handleChange} />
                {validationErrors.companyName && <span className="error-text">{validationErrors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>Contact No <span style={{ color: 'red' }}>*</span></label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
                {validationErrors.contactNo && <span className="error-text">{validationErrors.contactNo}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry <span style={{ color: 'red' }}>*</span></label>
                <input name="industry" value={formData.industry || ''} onChange={handleChange} />
                {validationErrors.industry && <span className="error-text">{validationErrors.industry}</span>}
              </div>
              <div className="form-group">
                <label>Company Size <span style={{ color: 'red' }}>*</span></label>
                <input name="companySize" value={formData.companySize || ''} onChange={handleChange} />
                {validationErrors.companySize && <span className="error-text">{validationErrors.companySize}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location <span style={{ color: 'red' }}>*</span></label>
                <input name="location" value={formData.location || ''} onChange={handleChange} />
                {validationErrors.location && <span className="error-text">{validationErrors.location}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Recruiter Name <span style={{ color: 'red' }}>*</span></label>
                <input name="recruiterName" value={formData.recruiterName || ''} onChange={handleChange} />
                {validationErrors.recruiterName && <span className="error-text">{validationErrors.recruiterName}</span>}
              </div>
              <div className="form-group">
                <label>Recruiter Email <span style={{ color: 'red' }}>*</span></label>
                <input type="email" name="recruiterEmail" value={formData.recruiterEmail || ''} onChange={handleChange} />
                {validationErrors.recruiterEmail && <span className="error-text">{validationErrors.recruiterEmail}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company Bio <span style={{ color: 'red' }}>*</span></label>
                <textarea name="companyBio" value={formData.companyBio || ''} onChange={handleChange} rows="3" style={{ resize: 'vertical' }} />
                {validationErrors.companyBio && <span className="error-text">{validationErrors.companyBio}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience <span style={{ color: 'red' }}>*</span></label>
                <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ''} onChange={handleChange} />
                {validationErrors.yearsOfExperience && <span className="error-text">{validationErrors.yearsOfExperience}</span>}
              </div>
            </div>
          </>
        )}
        <button type="submit" className="submit-btn">Save</button>
      </form>
    </div>
  );
};

export default Profile;
