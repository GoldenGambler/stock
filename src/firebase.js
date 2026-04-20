// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);