import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { balance, portfolio, trades, loading, totalPortfolioValue } = usePortfolio();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (loading) {
    return <div className="page-wrapper flex-center"><h3>Loading...</h3></div>;
  }

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {currentUser?.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(84, 90, 167, 0.2)', padding: '16px', borderRadius: '12px' }}>
            <Briefcase color="var(--liberty)" size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Portfolio Value</p>
            <h2 style={{ fontSize: '1.8rem' }}>{formatCurrency(totalPortfolioValue)}</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(49, 140, 231, 0.2)', padding: '16px', borderRadius: '12px' }}>
            <DollarSign color="var(--blue-de-france)" size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Available Cash</p>
            <h2 style={{ fontSize: '1.8rem' }}>{formatCurrency(balance)}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(216, 191, 216, 0.2)', padding: '16px', borderRadius: '12px' }}>
            <Activity color="var(--thistle)" size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Active Holdings</p>
            <h2 style={{ fontSize: '1.8rem' }}>{portfolio.length} Assets</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Your Portfolio</h2>
          {portfolio.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Symbol</th>
                    <th style={{ padding: '12px' }}>Shares</th>
                    <th style={{ padding: '12px' }}>Avg Cost</th>
                    <th style={{ padding: '12px' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => (
                    <tr key={item.symbol} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--blue-de-france)' }}>{item.symbol}</td>
                      <td style={{ padding: '16px 12px' }}>{item.shares}</td>
                      <td style={{ padding: '16px 12px' }}>{formatCurrency(item.totalCost / item.shares)}</td>
                      <td style={{ padding: '16px 12px' }}>{formatCurrency(item.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>No active holdings yet.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Recent Trades</h2>
          {trades.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Symbol</th>
                    <th style={{ padding: '12px' }}>Shares</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 12px' }}>{new Date(trade.date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: trade.type === 'buy' ? 'rgba(49, 140, 231, 0.2)' : 'rgba(216, 191, 216, 0.2)',
                          color: trade.type === 'buy' ? 'var(--little-boy-blue)' : 'var(--thistle)'
                        }}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{trade.symbol}</td>
                      <td style={{ padding: '16px 12px' }}>{trade.shares}</td>
                      <td style={{ padding: '16px 12px' }}>{formatCurrency(trade.price)}</td>
                      <td style={{ padding: '16px 12px' }}>{formatCurrency(trade.shares * trade.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>No trade history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
