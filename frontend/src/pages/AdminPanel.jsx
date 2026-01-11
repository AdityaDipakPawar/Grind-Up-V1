import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import OrgDetailModal from '../components/OrgDetailModal';

const Section = ({ title, loader, items, onApprove, onReject, onViewDetails, showActions = true }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ marginBottom: 12 }}>{title}</h2>
    {loader ? (
      <div>Loading…</div>
    ) : items.length === 0 ? (
      <div style={{ color: '#666' }}>No items to display</div>
    ) : (
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto', 
        maxHeight: '400px', 
        borderRadius: '4px', 
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1, boxShadow: '0 2px 2px rgba(0,0,0,0.05)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Contact</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Registered</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} style={{ backgroundColor: 'white' }}>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f1f1' }}>
                  {it.collegeName || it.companyName || '—'}
                </td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f1f1' }}>{it.email}</td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f1f1' }}>{it.contactNo || '—'}</td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f1f1' }}>
                  {new Date(it.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f1f1' }}>
                  <button 
                    onClick={() => onViewDetails(it)} 
                    style={{ 
                      marginRight: 8, 
                      padding: '6px 12px', 
                      backgroundColor: '#2196F3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="View full details"
                  >
                    View
                  </button>
                  {showActions && (
                    <>
                      <button 
                        onClick={() => onApprove(it._id)} 
                        style={{ 
                          marginRight: 8, 
                          padding: '6px 12px', 
                          backgroundColor: '#4CAF50', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onReject(it._id)} 
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loadingPendingColleges, setLoadingPendingColleges] = useState(false);
  const [loadingPendingCompanies, setLoadingPendingCompanies] = useState(false);
  const [loadingApprovedColleges, setLoadingApprovedColleges] = useState(false);
  const [loadingApprovedCompanies, setLoadingApprovedCompanies] = useState(false);
  const [pendingColleges, setPendingColleges] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedColleges, setApprovedColleges] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [error, setError] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedOrgType, setSelectedOrgType] = useState(null);

  const loadPendingColleges = async () => {
    try {
      setLoadingPendingColleges(true);
      const res = await adminAPI.getPendingColleges();
      setPendingColleges(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load pending colleges');
    } finally {
      setLoadingPendingColleges(false);
    }
  };

  const loadPendingCompanies = async () => {
    try {
      setLoadingPendingCompanies(true);
      const res = await adminAPI.getPendingCompanies();
      setPendingCompanies(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load pending companies');
    } finally {
      setLoadingPendingCompanies(false);
    }
  };

  const loadApprovedColleges = async () => {
    try {
      setLoadingApprovedColleges(true);
      const res = await adminAPI.getApprovedColleges();
      setApprovedColleges(res.data || []);
    } catch (e) {
      console.error('Failed to load approved colleges:', e);
      // Don't overwrite existing errors
    } finally {
      setLoadingApprovedColleges(false);
    }
  };

  const loadApprovedCompanies = async () => {
    try {
      setLoadingApprovedCompanies(true);
      const res = await adminAPI.getApprovedCompanies();
      setApprovedCompanies(res.data || []);
    } catch (e) {
      console.error('Failed to load approved companies:', e);
      // Don't overwrite existing errors
    } finally {
      setLoadingApprovedCompanies(false);
    }
  };

  useEffect(() => {
    loadPendingColleges();
    loadPendingCompanies();
    loadApprovedColleges();
    loadApprovedCompanies();
  }, []);

  const approvePendingCollege = async (id) => {
    await adminAPI.setCollegeApproval(id, 'approve');
    setPendingColleges((prev) => prev.filter((c) => c._id !== id));
    loadApprovedColleges();
  };
  const rejectPendingCollege = async (id) => {
    await adminAPI.setCollegeApproval(id, 'reject');
    setPendingColleges((prev) => prev.filter((c) => c._id !== id));
  };
  const approvePendingCompany = async (id) => {
    await adminAPI.setCompanyApproval(id, 'approve');
    setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
    loadApprovedCompanies();
  };
  const rejectPendingCompany = async (id) => {
    await adminAPI.setCompanyApproval(id, 'reject');
    setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
  };

  const handleViewDetails = (org, type) => {
    setSelectedOrg(org);
    setSelectedOrgType(type);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingBottom: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 24 }}>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <button 
            onClick={() => navigate('/admin/analytics')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff914d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📊 View Analytics
          </button>
        </div>
        {error && (
          <div style={{ background: '#fdecea', color: '#b00020', padding: '8px 12px', marginBottom: 16, borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <Section
          title="Pending Colleges"
          loader={loadingPendingColleges}
          items={pendingColleges}
          onApprove={approvePendingCollege}
          onReject={rejectPendingCollege}
          onViewDetails={(org) => handleViewDetails(org, 'college')}
          showActions={true}
        />

        <Section
          title="Pending Companies"
          loader={loadingPendingCompanies}
          items={pendingCompanies}
          onApprove={approvePendingCompany}
          onReject={rejectPendingCompany}
          onViewDetails={(org) => handleViewDetails(org, 'company')}
          showActions={true}
        />

        <div style={{ borderTop: '2px solid #ddd', paddingTop: 32, marginTop: 32 }}>
          <h2 style={{ marginBottom: 24, color: '#333' }}>Approved Organizations</h2>
          <Section
            title="Approved Colleges"
            loader={loadingApprovedColleges}
            items={approvedColleges}
            onViewDetails={(org) => handleViewDetails(org, 'college')}
            showActions={false}
          />

          <Section
            title="Approved Companies"
            loader={loadingApprovedCompanies}
            items={approvedCompanies}
            onViewDetails={(org) => handleViewDetails(org, 'company')}
            showActions={false}
          />
        </div>
      </div>

      <OrgDetailModal 
        organization={selectedOrg} 
        type={selectedOrgType}
        onClose={() => {
          setSelectedOrg(null);
          setSelectedOrgType(null);
        }}
      />
    </div>
  );
};

export default AdminPanel;
