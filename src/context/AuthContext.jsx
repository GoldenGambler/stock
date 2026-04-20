import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for Firestore timeouts
  const withTimeout = (promise, ms = 8000) => {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database connection timeout. Please make sure you have clicked 'Create Database' under Firestore Database in your Firebase Console.")), ms)
    );
    return Promise.race([promise, timeout]);
  };

  async function signup(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Initialize user in firestore with starting balance
    await withTimeout(setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      balance: 0, // start with 0 balance
      createdAt: new Date().toISOString()
    }));
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user exists in db
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userSnap = await withTimeout(getDoc(userRef));
    
    if (!userSnap.exists()) {
      await withTimeout(setDoc(userRef, {
        name: userCredential.user.displayName || 'Trader',
        email: userCredential.user.email,
        balance: 0,
        createdAt: new Date().toISOString()
      }));
    }
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  async function deleteAccount() {
    if (!currentUser) return;
    try {
      // Delete from Firestore first
      await withTimeout(deleteDoc(doc(db, 'users', currentUser.uid)));
      // Then delete from Auth
      await currentUser.delete();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
