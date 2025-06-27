import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';





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
