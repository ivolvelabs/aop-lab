// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLm4B4k9oLiNrq809eTyJRj0hZ15olk6Y",
  authDomain: "aop-lab.firebaseapp.com",
  projectId: "aop-lab",
  storageBucket: "aop-lab.appspot.com",
  messagingSenderId: "589069920397",
  appId: "1:589069920397:web:4d7e0160e93145bf741ac4",
  measurementId: "G-JJJ85ST0GS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); 