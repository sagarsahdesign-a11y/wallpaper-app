// firebase.js
// 🔥 REPLACE the config below with YOUR Firebase project credentials
// Get them from: https://console.firebase.google.com → Your Project → Project Settings → Your Apps

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3TYy-0hRMSPxa-eiRLpc5ZJK4wr94Uf0",
  authDomain: "wallpaperapp-b6822.firebaseapp.com",
  projectId: "wallpaperapp-b6822",
  storageBucket: "wallpaperapp-b6822.firebasestorage.app",
  messagingSenderId: "164948034426",
  appId: "1:164948034426:web:340acda1ad5646a5100cc3",
  measurementId: "G-FV9JS70ZDK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
