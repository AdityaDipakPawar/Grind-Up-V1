import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { profileAPI } from '../services/api.js';
import Footer from '../Footer';
import '../styles/Profile.css';

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});
  const [placementFile, setPlacementFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

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

  const handleUploadPlacementRecords = async () => {
    if (!placementFile) {
      setMessage('Please select a file first');
      return;
    }

    setUploadingFile(true);
    setMessage('');
    try {
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
    try {
      const res = await profileAPI.updateProfile(formData);
      if (res.success) {
        setMessage('Profile updated successfully');
        setFormData(res.data);
      } else {
        setMessage(res.message || 'Update failed');
      }
    } catch {
      setMessage('Update failed');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  const isCollege = (user?.type === 'college');

  return (
    <div className="container">
      <div style={{ padding: 20, paddingBottom: 0 }}>
        <h2>Profile</h2>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {isCollege ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>College Name</label>
                <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact No</label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input name="collegeCity" value={formData.collegeCity || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <input name="grade" value={formData.grade || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>TPO Name</label>
                <input name="tpoName" value={formData.tpoName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>TPO Contact No</label>
                <input name="tpoContactNo" value={formData.tpoContactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>University Affiliation</label>
                <input name="universityAffiliation" value={formData.universityAffiliation || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Courses</label>
                <input name="courses" value={formData.courses || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Students</label>
                <input name="numStudents" type="number" value={formData.numStudents || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Highest CGPA</label>
                <input name="highestCGPA" value={formData.highestCGPA || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average CTC</label>
                <input name="avgCTC" value={formData.avgCTC || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Average Placed</label>
                <input name="avgPlaced" type="number" value={formData.avgPlaced || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Placement Percent</label>
                <input name="placementPercent" value={formData.placementPercent || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Placement Records Section */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
              <h3 style={{ marginBottom: '15px' }}>Last 3 Years Placement Records</h3>
              <div className="form-group">
                <label>Upload Excel Sheet (.xls, .xlsx) - Max 5MB</label>
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
                <label>Company Name</label>
                <input name="companyName" value={formData.companyName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact No</label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry</label>
                <input name="industry" value={formData.industry || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <input name="companySize" value={formData.companySize || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={formData.location || ''} onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        <button type="submit" className="submit-btn">Save</button>
      </form>
      <Footer />
    </div>
  );
};

export default Profile;
