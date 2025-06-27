import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
  measurementId: "G-JJJ85ST0GS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const theme = createTheme({
  typography: {
    fontFamily: ["Poppins", "sans-serif", "Verdana"].join(","),
  },
  palette: {
    primary: {
      main: "#0066cb",
    },
    secondary: {
      main: "#00cbcb",
    },
    text: {
      main: "#98cbff",
    },
    bgColor: {
      // main: "#e3f2fd",
      main: "#eeeeee",
    },
  },
});



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path='/*' element={<App theme={theme} />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
    </BrowserRouter>
    {/* <Login /> */}
  </React.StrictMode>
);



// ReactDOM.render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>,
//   document.getElementById("root")
// );


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
