import { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock function to generate fake stock data
const generateMockData = (basePrice) => {
  let data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.05);
    currentPrice += change;
    data.push({
      day: `Day ${i + 1}`,
      price: Math.max(0.01, Number(currentPrice.toFixed(2)))
    });
  }
  return data;
};

export default function Trade() {
  const [symbol, setSymbol] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [shares, setShares] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { balance, portfolio, executeTrade } = usePortfolio();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Simulate searching a stock
    const mockBasePrice = Math.random() * 500 + 50; // Random price between 50 and 550
    const data = generateMockData(mockBasePrice);
    
    setSymbol(searchQuery.toUpperCase());
    setStockData(data);
    setCurrentPrice(data[data.length - 1].price);
    setError('');
    setSuccess('');
    setShares(1);
  };

  const handleTrade = async (type) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await executeTrade(symbol, shares, currentPrice, type);
      
      setSuccess(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${symbol}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const ownedShares = portfolio.find(h => h.symbol === symbol)?.shares || 0;

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Trade Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Search for a symbol and execute paper trades.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search stock symbol (e.g., AAPL, TSLA)" 
              style={{ paddingLeft: '48px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="glass-button">Search</button>
        </form>
      </div>

      {stockData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Chart Section */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {symbol} <TrendingUp color="var(--little-boy-blue)" />
                </h2>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--blue-de-france)' }}>{formatCurrency(currentPrice)}</h3>
              </div>
            </div>

            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-gradient-start)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--little-boy-blue)' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="var(--blue-de-france)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Section */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Execute Trade</h3>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Buying Power</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(balance)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shares Owned</span>
                <span style={{ fontWeight: 'bold' }}>{ownedShares}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Quantity (Shares)</label>
              <input 
                type="number" 
                className="glass-input" 
                min="1"
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 1)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.2rem' }}>
              <span>Estimated Cost</span>
              <span style={{ fontWeight: 'bold', color: 'var(--thistle)' }}>{formatCurrency(currentPrice * shares)}</span>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(0, 255, 0, 0.1)', color: '#4ade80', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button 
                className="glass-button" 
                style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                onClick={() => handleTrade('buy')}
                disabled={loading}
              >
                Buy
              </button>
              <button 
                className="glass-button" 
                style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                onClick={() => handleTrade('sell')}
                disabled={loading || ownedShares === 0}
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
