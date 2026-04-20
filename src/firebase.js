
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👇 paste your REAL config here
const firebaseConfig = {
  apiKey: "AIzaSyBpx6JBccaPXXjgtI4AHZ2OhkTeaJlq1Cw",
  authDomain: "stock-aced7.firebaseapp.com",
  projectId: "stock-aced7",
  storageBucket: "stock-aced7.firebasestorage.app",
  messagingSenderId: "730162706286",
  appId: "1:730162706286:web:bf32dc6f0690abcb39737f",
  measurementId: "G-P87GP7Q69F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ THESE WERE MISSING
export const auth = getAuth(app);
export const db = getFirestore(app);