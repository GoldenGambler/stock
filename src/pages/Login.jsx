import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleAuth() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper flex-center container">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', color: 'var(--platinum)' }}>
          Welcome Back
        </h2>
        
        {error && <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255, 0, 0, 0.2)' }}>{error}</div>}

        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '8px' }}>
          Sign in to access your portfolio and continue paper trading.
        </p>

        <button disabled={loading} onClick={handleGoogleAuth} className="glass-button" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
