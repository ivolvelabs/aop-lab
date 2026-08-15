import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./Contexts/AuthContext";

const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: ["Poppins", "sans-serif", "Verdana"].join(","),
    h1: { letterSpacing: 0 },
    h2: { letterSpacing: 0 },
    h3: { letterSpacing: 0 },
    h4: { letterSpacing: 0 },
    h5: { letterSpacing: 0 },
    h6: { letterSpacing: 0 },
  },
  palette: {
    background: {
      default: "#f6f8fb",
      paper: "#ffffff",
    },
    primary: {
      main: "#0057b8",
      dark: "#073b7a",
    },
    secondary: {
      main: "#00a7a7",
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
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
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
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
