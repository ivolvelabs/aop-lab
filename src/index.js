import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';


const theme = createTheme({
  shape: {
    borderRadius: 10,
  },
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
    info: {
      main: "#0b74d1",
    },
    text: {
      main: "#98cbff",
      primary: "#1c2733",
      secondary: "#41566d",
    },
    bgColor: {
      // main: "#e3f2fd",
      main: "#eeeeee",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 20px rgba(16, 24, 40, 0.08)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.12)",
        },
      },
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
          <Route path='/*' element={<App />} />
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
