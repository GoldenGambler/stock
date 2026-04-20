import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const PortfolioContext = createContext();

export function usePortfolio() {
  return useContext(PortfolioContext);
}

export function PortfolioProvider({ children }) {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]); // List of holdings
  const [trades, setTrades] = useState([]); // Trade history
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      setBalance(0);
      setPortfolio([]);
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch balance
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setBalance(userSnap.data().balance);
      }

      // Fetch trades
      const tradesRef = collection(db, 'trades');
      const q = query(tradesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const tradesData = [];
      querySnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort trades by date descending
      tradesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTrades(tradesData);

      // Calculate portfolio from trades
      const holdings = {};
      tradesData.forEach(trade => {
        if (!holdings[trade.symbol]) {
          holdings[trade.symbol] = { symbol: trade.symbol, shares: 0, totalCost: 0, currentPrice: trade.price }; // using last trade price as current price initially
        }
        
        if (trade.type === 'buy') {
          holdings[trade.symbol].shares += trade.shares;
          holdings[trade.symbol].totalCost += (trade.shares * trade.price);
        } else if (trade.type === 'sell') {
          holdings[trade.symbol].shares -= trade.shares;
          // simplify cost basis calculation for this project
          holdings[trade.symbol].totalCost -= (trade.shares * (holdings[trade.symbol].totalCost / (holdings[trade.symbol].shares + trade.shares))); 
        }
      });

      const activeHoldings = Object.values(holdings).filter(h => h.shares > 0);
      setPortfolio(activeHoldings);

    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const executeTrade = async (symbol, shares, price, type) => {
    if (!currentUser) throw new Error("Must be logged in to trade");
    
    const cost = shares * price;
    
    if (type === 'buy' && balance < cost) {
      throw new Error("Insufficient funds");
    }
    
    if (type === 'sell') {
      const holding = portfolio.find(h => h.symbol === symbol);
      if (!holding || holding.shares < shares) {
        throw new Error("Insufficient shares");
      }
    }

    const newBalance = type === 'buy' ? balance - cost : balance + cost;

    // Update balance in users collection
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { balance: newBalance });

    // Add trade record
    await addDoc(collection(db, 'trades'), {
      userId: currentUser.uid,
      symbol,
      shares: Number(shares),
      price: Number(price),
      type,
      date: new Date().toISOString()
    });

    // Refresh data
    await fetchUserData();
  };

  const totalPortfolioValue = useMemo(() => {
    // In a real app we'd fetch live prices here. For simulation, we use the last traded price or a mock price.
    const holdingsValue = portfolio.reduce((acc, holding) => acc + (holding.shares * holding.currentPrice), 0);
    return balance + holdingsValue;
  }, [portfolio, balance]);

  const value = {
    balance,
    portfolio,
    trades,
    loading,
    executeTrade,
    totalPortfolioValue,
    refreshData: fetchUserData
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
