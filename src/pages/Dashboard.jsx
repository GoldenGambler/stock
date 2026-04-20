import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, DollarSign, Activity, PieChart as PieChartIcon, TrendingUp, TrendingDown, Terminal } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

// Deterministic pseudo-random number generator
const seedRandom = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { balance, userData, portfolio, trades, loading, totalPortfolioValue, addFunds } = usePortfolio();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState(10000);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getDisplayName = () => {
    if (userData?.name) return userData.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'SysAdmin';
  };

  // Mock data for the area chart (Portfolio History)
  const portfolioHistory = useMemo(() => {
    let data = [];
    
    // Create a seed based on the user's uid so it's consistent for the user across refreshes
    let userSeed = 0;
    const seedString = currentUser?.uid || 'default';
    for (let i = 0; i < seedString.length; i++) {
      userSeed += seedString.charCodeAt(i);
    }

    let currentVal = totalPortfolioValue > 0 ? totalPortfolioValue * 0.8 : 10000;
    for(let i=0; i<30; i++) {
      currentVal += (seedRandom(userSeed + i) - 0.45) * (currentVal * 0.05);
      data.push({
        day: `T-${30-i}`,
        value: currentVal
      });
    }
    // Set the last point to exact current value
    if (totalPortfolioValue > 0) {
      data[data.length-1].value = totalPortfolioValue;
    }
    return data;
  }, [totalPortfolioValue, currentUser?.uid]);

  // Data for Pie Chart
  const COLORS = ['#5B61B2', '#2F80E4', '#6DA0E1', '#DEC1DB', '#EEE2DF'];
  const allocationData = useMemo(() => {
    let data = portfolio.map(item => ({
      name: item.symbol,
      value: item.totalCost
    }));
    if (balance > 0) {
      data.push({ name: 'CASH', value: balance });
    }
    return data;
  }, [portfolio, balance]);

  if (loading) {
    return <div className="page-wrapper flex-center"><h3 className="data-font text-gradient">INITIALIZING SYSTEM...</h3></div>;
  }

  const totalAssets = totalPortfolioValue + balance;

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '40px' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header-title" style={{ fontSize: '2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            <Terminal size={28} color="var(--blue-de-france)" />
            System_Dashboard
          </h1>
          <p className="data-font" style={{ color: 'var(--little-boy-blue)' }}>USER: {getDisplayName()} | STATUS: ONLINE</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-button-outline data-font"
          style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%', maxWidth: '200px' }}
        >
          + Add Cash
        </button>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--blue-de-france)' }}>
          <p style={{ color: 'var(--thistle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Net Worth</p>
          <h2 className="data-font" style={{ fontSize: '1.8rem', color: 'var(--platinum)' }}>{formatCurrency(totalAssets)}</h2>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--liberty)' }}>
          <p style={{ color: 'var(--thistle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Available Cash</p>
          <h2 className="data-font" style={{ fontSize: '1.8rem', color: 'var(--little-boy-blue)' }}>{formatCurrency(balance)}</h2>
        </div>



        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--thistle)' }}>
          <p style={{ color: 'var(--thistle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Nodes</p>
          <h2 className="data-font" style={{ fontSize: '1.8rem', color: 'var(--platinum)' }}>{portfolio.length} POSITIONS</h2>
        </div>
      </div>

      <div className="responsive-grid-2-1" style={{ marginBottom: '24px' }}>
        {/* Main Chart */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--little-boy-blue)' }}>Portfolio Trajectory</h3>
            <span className="data-font" style={{ fontSize: '0.8rem', color: 'var(--thistle)' }}>30D TREND</span>
          </div>
          <div style={{ flex: 1, minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue-de-france)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--blue-de-france)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--liberty)" tick={{fontSize: 10, fill: 'var(--thistle)'}} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--liberty)" domain={['auto', 'auto']} tick={{fontSize: 10, fill: 'var(--thistle)'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.9)', border: '1px solid var(--blue-de-france)', borderRadius: '0px', fontFamily: '"Share Tech Mono", monospace' }}
                  itemStyle={{ color: 'var(--platinum)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--blue-de-france)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--little-boy-blue)' }}>Asset Allocation</h3>
          </div>
          <div style={{ flex: 1, minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.9)', border: '1px solid var(--blue-de-france)', fontFamily: '"Share Tech Mono", monospace', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--platinum)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <p className="data-font" style={{color: 'var(--thistle)', fontSize: '0.8rem'}}>NO DATA AVALIABLE</p>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
             {allocationData.map((entry, index) => (
                <div key={entry.name} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <div style={{width: '8px', height: '8px', backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="data-font" style={{fontSize: '0.7rem', color: 'var(--platinum)'}}>{entry.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="responsive-grid-1-1" style={{ gap: '24px' }}>
        {/* Positions Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(91, 97, 178, 0.2)', borderBottom: '1px solid var(--liberty)' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--platinum)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={16} /> DATA_TABLE: POSITIONS
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr className="data-font" style={{ color: 'var(--thistle)', background: 'rgba(0,0,0,0.3)' }}>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>SYM</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>VOL</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>AVG</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>VAL</th>
                </tr>
              </thead>
              <tbody className="data-font">
                {portfolio.length > 0 ? portfolio.map((item) => (
                  <tr key={item.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--little-boy-blue)' }}>{item.symbol}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--platinum)' }}>{item.shares}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--platinum)' }}>{formatCurrency(item.totalCost / item.shares)}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--platinum)' }}>{formatCurrency(item.totalCost)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--thistle)' }}>[NO_ACTIVE_POSITIONS]</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trades Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(91, 97, 178, 0.2)', borderBottom: '1px solid var(--liberty)' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--platinum)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> LOG: TRANSACTIONS
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr className="data-font" style={{ color: 'var(--thistle)', background: 'rgba(0,0,0,0.3)' }}>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>TS</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>OP</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>SYM</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>AMT</th>
                </tr>
              </thead>
              <tbody className="data-font">
                {trades.length > 0 ? trades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--thistle)' }}>{new Date(trade.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 20px', color: trade.type === 'buy' ? 'var(--blue-de-france)' : 'var(--liberty)' }}>
                      [{trade.type.toUpperCase()}]
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--little-boy-blue)' }}>{trade.symbol}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--platinum)' }}>{formatCurrency(trade.shares * trade.price)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--thistle)' }}>[NO_TRANSACTION_LOGS]</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--blue-de-france)', boxShadow: '0 0 30px rgba(47, 128, 228, 0.3)' }}>
            <h2 className="data-font" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--little-boy-blue)' }}>Add Cash</h2>
            <p className="data-font" style={{ color: 'var(--thistle)', margin: 0, fontSize: '0.8rem', lineHeight: '1.5' }}>
              Add virtual funds to your account to continue paper trading.
            </p>
            <div>
              <label className="data-font" style={{ display: 'block', marginBottom: '8px', color: 'var(--platinum)', fontSize: '0.9rem' }}>Amount (USD)</label>
              <input 
                type="number"
                className="glass-input data-font"
                value={addAmount}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                min="1"
                style={{ fontSize: '1.2rem', color: 'var(--blue-de-france)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="glass-button-outline data-font" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="glass-button data-font" style={{ flex: 1, borderRadius: '4px' }}
                onClick={async () => {
                  try {
                    await addFunds(addAmount);
                    setIsModalOpen(false);
                    setAddAmount(10000);
                  } catch (e) {
                    alert(e.message);
                  }
                }}
              >
                Add Cash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
