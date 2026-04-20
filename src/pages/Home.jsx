import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="page-wrapper container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '80px', gap: '24px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', maxWidth: '800px' }}>
          Master the Market, <br/>
          <span className="text-gradient">Risk-Free.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
          TradeSim is the ultimate paper trading platform. Test your strategies, analyze real-time data, and build your virtual portfolio without losing a dime.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <Link to="/login" className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', padding: '14px 32px' }}>
            Start Trading <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginTop: '100px',
        paddingBottom: '60px'
      }}>
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(49, 140, 231, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp color="var(--blue-de-france)" size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>Real-time Simulation</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>Experience the thrill of the market with simulated trades executed instantly based on actual market data.</p>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(216, 191, 216, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield color="var(--thistle)" size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>Zero Financial Risk</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>Start with $100,000 in virtual cash. Make mistakes, learn, and iterate without the financial anxiety.</p>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(84, 90, 167, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 color="var(--liberty)" size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>Portfolio Tracking</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>Monitor your gains and losses with an intuitive dashboard that tracks your entire trade history.</p>
        </div>
      </div>
    </div>
  );
}
