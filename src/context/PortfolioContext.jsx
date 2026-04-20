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
  const [userData, setUserData] = useState(null);
  const [portfolio, setPortfolio] = useState([]); // List of holdings
  const [trades, setTrades] = useState([]); // Trade history
  const [loading, setLoading] = useState(true);

  // Helper for Firestore timeouts
  const withTimeout = (promise, ms = 8000) => {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database connection timeout. Please make sure you have clicked 'Create Database' under Firestore Database in your Firebase Console.")), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      setBalance(0);
      setUserData(null);
      setPortfolio([]);
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch balance
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await withTimeout(getDoc(userRef));
      if (userSnap.exists()) {
        setBalance(userSnap.data().balance);
        setUserData(userSnap.data());
      }

      // Fetch trades
      const tradesRef = collection(db, 'trades');
      const q = query(tradesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await withTimeout(getDocs(q));
      
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
      alert(error.message || "Failed to connect to the database. Check your Firestore Database setup.");
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

  const addFunds = async (amount) => {
    if (!currentUser) throw new Error("Must be logged in");
    const newBalance = balance + amount;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { balance: newBalance });
    setBalance(newBalance);
    setUserData(prev => ({ ...prev, balance: newBalance }));
  };

  const value = {
    balance,
    userData,
    portfolio,
    trades,
    loading,
    executeTrade,
    addFunds,
    totalPortfolioValue,
    refreshData: fetchUserData
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
