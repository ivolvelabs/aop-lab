// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : {};
const legacyEnv = typeof process !== "undefined" ? process.env : {};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:
    viteEnv.VITE_FIREBASE_API_KEY ||
    legacyEnv.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyBLm4B4k9oLiNrq809eTyJRj0hZ15olk6Y",
  authDomain:
    viteEnv.VITE_FIREBASE_AUTH_DOMAIN ||
    legacyEnv.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "aop-lab.firebaseapp.com",
  projectId:
    viteEnv.VITE_FIREBASE_PROJECT_ID ||
    legacyEnv.REACT_APP_FIREBASE_PROJECT_ID ||
    "aop-lab",
  storageBucket:
    viteEnv.VITE_FIREBASE_STORAGE_BUCKET ||
    legacyEnv.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "aop-lab.appspot.com",
  messagingSenderId:
    viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    legacyEnv.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    "589069920397",
  appId:
    viteEnv.VITE_FIREBASE_APP_ID ||
    legacyEnv.REACT_APP_FIREBASE_APP_ID ||
    "1:589069920397:web:4d7e0160e93145bf741ac4",
  measurementId:
    viteEnv.VITE_FIREBASE_MEASUREMENT_ID ||
    legacyEnv.REACT_APP_FIREBASE_MEASUREMENT_ID ||
    "G-JJJ85ST0GS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
  getAnalytics(app);
}
export const auth = getAuth(app);
export const db = getFirestore(app);
