import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";

export default function Login() {
  const { setIsLoggedIn, setAuthUser, setRole, setUser } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/';


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      setAuthUser(user);
      await setUser(docSnap.data());
      setRole(docSnap.data().role);
      navigate('/', {replace: "true"});
    } catch (error) {
      setError("Failed to log in");
      setIsLoggedIn(false);
      setRole(null);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
      }}
    >
      <Paper elevation={3} style={{ padding: "16px" }}>
        <Grid container justifyContent="center" alignItems="center" spacing={4}>
          <Grid item xs={12} md={6}>
            <Box textAlign="center">
              {/* Left Section */}
              <img
                src="logo.png" // Replace with your logo image URL
                alt="Logo"
                style={{ width: "100%", height: "100%" }}
              />
              <Typography style={{ marginTop: "20px" }} variant="h4">Dr. Avani's Oncopath Lab App</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              {/* Right Section */}
              <Typography variant="h5" align="center">
                Log In
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      label="Email Address"
                      type="email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      label="Password"
                      type="password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  style={{ marginTop: "16px" }}
                >
                  {loading ? <CircularProgress size={24} /> : "Log In"}
                </Button>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

