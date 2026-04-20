import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Deterministic pseudo-random number generator
const seedRandom = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Mock function to generate highly consistent fake stock data based on symbol
const generateMockData = (symbol) => {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed += symbol.charCodeAt(i);
  }
  
  // Base price between 20 and 1000
  const basePrice = 20 + (seedRandom(seed) * 980);
  
  let data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < 30; i++) {
    const change = (seedRandom(seed + i) - 0.48) * (basePrice * 0.05); // Slight upward bias
    currentPrice += change;
    data.push({
      day: `Day ${i + 1}`,
      price: Math.max(0.01, Number(currentPrice.toFixed(2)))
    });
  }
  return data;
};

const TRENDING_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'PLTR', name: 'Palantir Technologies' },
  { symbol: 'NFLX', name: 'Netflix Inc.' }
];

export default function Trade() {
  const [symbol, setSymbol] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [shares, setShares] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { balance, portfolio, executeTrade } = usePortfolio();

  const performSearch = (targetSymbol) => {
    const upperSymbol = targetSymbol.toUpperCase();
    const data = generateMockData(upperSymbol);
    
    setSymbol(upperSymbol);
    setSearchQuery(upperSymbol);
    setStockData(data);
    setCurrentPrice(data[data.length - 1].price);
    setError('');
    setSuccess('');
    setShares(1);
  };

  useEffect(() => {
    const urlSymbol = searchParams.get('symbol');
    if (urlSymbol && urlSymbol.toUpperCase() !== symbol) {
      performSearch(urlSymbol);
    } else if (!urlSymbol && stockData) {
      setStockData(null);
      setSymbol('');
      setSearchQuery('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (e, overrideSymbol = null) => {
    if (e) e.preventDefault();
    const targetSymbol = overrideSymbol || searchQuery;
    if (!targetSymbol) return;
    
    setSearchParams({ symbol: targetSymbol.toUpperCase() });
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

      {/* Top 10 Trending Stocks */}
      {!stockData && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp color="var(--little-boy-blue)" /> Top 10 Trending Stocks
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {TRENDING_STOCKS.map((stock) => {
              const mockPrice = generateMockData(stock.symbol);
              const currentPrice = mockPrice[mockPrice.length - 1].price;
              const prevPrice = mockPrice[mockPrice.length - 2].price;
              const isUp = currentPrice >= prevPrice;
              
              return (
                <div 
                  key={stock.symbol} 
                  className="glass-panel" 
                  style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}
                  onClick={() => handleSearch(null, stock.symbol)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '4px' }}>{stock.symbol}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stock.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>${currentPrice.toFixed(2)}</span>
                    <span style={{ color: isUp ? '#4ade80' : '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {isUp ? '+' : ''}{((currentPrice - prevPrice) / prevPrice * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stockData && (
        <div className="responsive-trade-grid">
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

            <div style={{ height: '420px', width: '100%' }}>
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
