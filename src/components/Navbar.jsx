import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, LogOut, TrendingUp, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const closeMenu = () => setIsMobileMenuOpen(false);

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
      <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <Activity color="var(--little-boy-blue)" />
        <span className="text-gradient">TradeSim</span>
      </Link>

      {/* Hamburger Icon */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={28} color="var(--little-boy-blue)" /> : <Menu size={28} color="var(--little-boy-blue)" />}
      </button>

      {/* Desktop Nav */}
      <div className="desktop-nav">
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

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {currentUser ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '500' }}>
                <LayoutDashboard size={20} color="var(--thistle)" /> Dashboard
              </Link>
              <Link to="/trade" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '500' }}>
                <TrendingUp size={20} color="var(--blue-de-france)" /> Trade
              </Link>
              <Link to="/profile" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '500' }}>
                <User size={20} color="var(--text-primary)" /> Profile
              </Link>
              <button onClick={handleLogout} className="glass-button-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontSize: '1rem', marginTop: '12px' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontSize: '1rem' }}>
              <User size={18} /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
