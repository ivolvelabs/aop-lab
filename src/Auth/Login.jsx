// import React, { useState } from "react";
// import { signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
// import { auth } from "./firebase";
// import { useAuth } from "./AuthContext";


// export default function Login() {
// const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, setRole, role } = useAuth()


//   const [email, setEmail] = useState(null);
//   const [password, setPassword] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);




// const login = (email, password) => {
//   // e.preventDefault()
//   signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       const user = userCredential.user;
//       console.log(user);
//       setIsLoggedIn(true);
//       setAuthUser(user);
//       setLoading(false);
//     setRole("admin");

//     })
//     .catch((error) => {
//       setIsLoggedIn(false);
//       setRole(null);
//       const errorCode = error.code;
//       const errorMessage = error.message;
//     });
// };

// async function handleSubmit(e) {
//     e.preventDefault();

//     try {
//       setError("");
//       setLoading(true);
//       await login(email, password);
//     } catch {
//       setError("Failed to log in");
//     }

//     setLoading(false);
//   }

//   return (
//     <div>
//       {error && <p>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button disabled={loading} type="submit">
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }



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
import { auth } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";

export default function Login() {
  const { setIsLoggedIn, setAuthUser, setRole } = useAuth();
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
      setIsLoggedIn(true);
      setAuthUser(user);
      setRole("admin");
      // <Navigate to="/" replace />
      navigate('/', {replace: "true"});
      // navigate(from, {replace: "true"});
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
    <Container component="main" maxWidth="md" style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", width: "100vw" }}>
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
              <Typography variant="h6">Avanis Oncopath Lab</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              {/* Right Section */}
              <Typography variant="h5" align="center">
                Log In
              </Typography>
              {error && (
                <Typography variant="body2" color="error" align="center">
                  {error}
                </Typography>
              )}
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

