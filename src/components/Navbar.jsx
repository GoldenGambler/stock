import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, LogOut, TrendingUp, User } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '16px 24px',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }} className="glass">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <Activity color="var(--little-boy-blue)" />
        <span className="text-gradient">TradeSim</span>
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {currentUser ? (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              <LayoutDashboard size={18} color="var(--thistle)" /> Dashboard
            </Link>
            <Link to="/trade" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              <TrendingUp size={18} color="var(--blue-de-france)" /> Trade
            </Link>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              <User size={18} color="var(--text-primary)" /> Profile
            </Link>
            <button onClick={handleLogout} className="glass-button-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '0.9rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} /> Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
