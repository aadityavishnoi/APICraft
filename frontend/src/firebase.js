import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmwuj8kkSsqsc1iPsCcsgddfDCApakRbI",
  authDomain: "apicraft-ce0a0.firebaseapp.com",
  projectId: "apicraft-ce0a0",
  storageBucket: "apicraft-ce0a0.firebasestorage.app",
  messagingSenderId: "246501120303",
  appId: "1:246501120303:web:7f5139fee9007ebf7929da",
  measurementId: "G-BER4Z173FQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
