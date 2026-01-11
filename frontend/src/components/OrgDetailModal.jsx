import React from 'react';
import '../styles/orgDetailModal.css';

const OrgDetailModal = ({ organization, type, onClose }) => {
  if (!organization) return null;

  const isCollege = type === 'college';
  const name = isCollege ? organization.collegeName : organization.companyName;

  const FieldRow = ({ label, value, isLink = false }) => (
    <div className="org-field">
      <span className="org-label">{label}:</span>
      <span className="org-value">
        {!value ? (
          <span className="org-empty">—</span>
        ) : isLink ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="org-link"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </div>
  );

  return (
    <div className="org-modal-overlay" onClick={onClose}>
      <div className="org-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="org-modal-header">
          <h2>{name}</h2>
          <button className="org-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="org-modal-body">
          {/* Basic Information */}
          <div className="org-section">
            <h3>📋 Basic Information</h3>
            <FieldRow label="Email" value={organization.email} />
            <FieldRow label="Contact No" value={organization.contactNo} />
            {!isCollege && <FieldRow label="Location" value={organization.location} />}
            <FieldRow label="Status" value={organization.approvalStatus?.charAt(0).toUpperCase() + organization.approvalStatus?.slice(1)} />
          </div>

          {/* College-Specific Details */}
          {isCollege && (
            <>
              <div className="org-section">
                <h3>🎓 College Information</h3>
                <FieldRow label="City" value={organization.collegeCity} />
                <FieldRow label="University Affiliation" value={organization.universityAffiliation} />
                <FieldRow label="Grade/Ranking" value={organization.grade} />
                <FieldRow label="Courses Offered" value={organization.courses} />
              </div>

              <div className="org-section">
                <h3>👥 TPO Details</h3>
                <FieldRow label="TPO Name" value={organization.tpoName} />
                <FieldRow label="TPO Contact No" value={organization.tpoContactNo} />
              </div>

              <div className="org-section">
                <h3>📊 Placement Statistics</h3>
                <FieldRow label="Number of Students" value={organization.numStudents} />
                <FieldRow label="Highest CGPA" value={organization.highestCGPA} />
                <FieldRow label="Average CTC" value={organization.avgCTC} />
                <FieldRow label="Average Placed" value={organization.avgPlaced} />
                <FieldRow label="Placement Percentage" value={organization.placementPercent} />
                <FieldRow 
                  label="Placement Records" 
                  value={organization.placementRecordUrl} 
                  isLink={!!organization.placementRecordUrl}
                />
              </div>
            </>
          )}

          {/* Company-Specific Details */}
          {!isCollege && (
            <>
              <div className="org-section">
                <h3>🏢 Company Information</h3>
                <FieldRow label="Industry" value={organization.industry} />
                <FieldRow label="Company Size" value={organization.companySize} />
                <FieldRow label="Location" value={organization.location} />
              </div>
            </>
          )}

          {/* Social Links */}
          {(organization.linkedinProfile || organization.collegeWebsite || organization.companyWebsite) && (
            <div className="org-section">
              <h3>🔗 Social Links</h3>
              {organization.linkedinProfile && (
                <FieldRow label="LinkedIn Profile" value={organization.linkedinProfile} isLink={true} />
              )}
              {organization.collegeWebsite && (
                <FieldRow label="College Website" value={organization.collegeWebsite} isLink={true} />
              )}
              {organization.companyWebsite && (
                <FieldRow label="Company Website" value={organization.companyWebsite} isLink={true} />
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="org-section org-metadata">
            <small>Registered: {new Date(organization.createdAt).toLocaleString()}</small>
            {organization.updatedAt && (
              <small>Last Updated: {new Date(organization.updatedAt).toLocaleString()}</small>
            )}
          </div>
        </div>

        <div className="org-modal-footer">
          <button onClick={onClose} className="org-btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgDetailModal;
