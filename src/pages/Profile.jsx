import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Trash2, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const { currentUser, deleteAccount } = useAuth();
  const { userData, totalPortfolioValue, balance } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getDisplayName = () => {
    if (userData?.name) return userData.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Trader';
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      // If user needs to re-authenticate
      if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, you need to log out and log back in before deleting your account.');
      } else {
        setError(err.message || 'Failed to delete account');
      }
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences.</p>
      </div>

      <div className="responsive-profile-grid">
        {/* Profile Info Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--blue-de-france), var(--liberty))',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(49, 140, 231, 0.3)'
          }}>
            <User size={64} color="white" />
          </div>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{getDisplayName()}</h2>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Mail size={16} /> {currentUser?.email}
          </p>
          
          <div style={{ width: '100%', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since</span>
              <span style={{ fontWeight: '500' }}>{formatDate(userData?.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Assets</span>
              <span style={{ fontWeight: '500', color: 'var(--blue-de-france)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((totalPortfolioValue || 0) + (balance || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Danger Zone</h3>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Once you delete your account, there is no going back. Please be certain. This will permanently delete your user profile, portfolio data, and trade history.
            </p>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={20} />
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            {!showConfirm ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="glass-button-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Trash2 size={18} /> Delete Account
              </button>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '12px' }}>
                <p style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '16px' }}>Are you absolutely sure?</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="glass-button"
                    style={{ background: '#ef4444', flex: 1 }}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="glass-button-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
