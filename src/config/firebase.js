import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// La configurazione di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_ipbJ4-7tO836Mqpm4T8JxtbLpNpTkh0",
  authDomain: "eddystyle-4e8ac.firebaseapp.com",
  projectId: "eddystyle-4e8ac",
  storageBucket: "eddystyle-4e8ac.firebasestorage.app",
  messagingSenderId: "171770258268",
  appId: "1:171770258268:web:d2d7f8c7fdf5137e021799"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 