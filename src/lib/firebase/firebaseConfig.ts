// src/services/firebase/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Importar o getStorage

// Suas variáveis de ambiente do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD5DKF-MN0JyIVI0uNxqvqaKu8ozr7sWTE",
  authDomain: "site-ad-plenitude.firebaseapp.com",
  projectId: "site-ad-plenitude",
  storageBucket: "site-ad-plenitude.firebasestorage.app",
  messagingSenderId: "612531878513",
  appId: "1:612531878513:web:e0a5cc939d3f68d27cb9d0",
  measurementId: "G-BQCK04DEES"
};

// Inicializar o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 3. Inicializar e exportar o storage

export { app, auth, db, storage }; // 4. Adicionar storage ao export