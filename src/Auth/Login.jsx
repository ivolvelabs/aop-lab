import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
  Stack,
  InputAdornment,
} from "@mui/material";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import { Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

const isAccountActive = (data) => data?.active !== false && !data?.archivedAt;

const isLoginAllowed = (data) =>
  isAccountActive(data) &&
  (data?.role !== "thirdparty" || data?.loginAccess !== false);

const findThirdPartyByAuthUid = async (uid) => {
  const directDocSnap = await getDoc(doc(db, "thirdparty", uid));
  if (directDocSnap.exists()) {
    return {
      id: directDocSnap.id,
      ...directDocSnap.data(),
    };
  }

  const authUidQuery = query(
    collection(db, "thirdparty"),
    where("authUid", "==", uid),
    limit(1)
  );
  const authUidSnapshot = await getDocs(authUidQuery);

  if (authUidSnapshot.empty) return null;

  const thirdPartyDoc = authUidSnapshot.docs[0];
  return {
    id: thirdPartyDoc.id,
    ...thirdPartyDoc.data(),
  };
};

export default function Login() {
  const { setIsLoggedIn, setAuthUser, setRole, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";


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
      const usersDocSnap = await getDoc(doc(db, "users", user.uid));
      const thirdPartyData = usersDocSnap.exists()
        ? null
        : await findThirdPartyByAuthUid(user.uid);
      const roleData = usersDocSnap.exists()
        ? { id: usersDocSnap.id, ...usersDocSnap.data() }
        : thirdPartyData;

      if (!roleData || !isLoginAllowed(roleData)) {
        await signOut(auth);
        setError("This account is inactive. Please contact the lab administrator.");
        setIsLoggedIn(false);
        setRole(null);
        setUser(null);
        return;
      }

      setAuthUser(user);
      setUser(roleData);
      setRole(roleData?.role || null);
      navigate(from, { replace: true });
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
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at 12% 18%, rgba(0, 167, 167, 0.16), transparent 32%), linear-gradient(135deg, #f7fbff 0%, #eef4f8 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "min(1040px, 100%)",
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.22)",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.14)",
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              minHeight: { xs: 280, md: 560 },
              p: { xs: 3, md: 5 },
              color: "white",
              background:
                "linear-gradient(160deg, rgba(0, 87, 184, 0.98), rgba(0, 167, 167, 0.9))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 78,
                  height: 78,
                  borderRadius: 3,
                  bgcolor: "white",
                  display: "grid",
                  placeItems: "center",
                  mb: 3,
                  boxShadow: "0 18px 36px rgba(15, 23, 42, 0.22)",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Avnis Oncopathology Lab"
                  style={{ width: 68, height: 68, objectFit: "contain" }}
                />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.05,
                  mb: 1.5,
                  fontSize: { xs: "2.35rem", sm: "3rem", md: "3rem" },
                }}
              >
                Avnis Oncopathology Lab
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 390 }}>
                Secure workspace for booking, reporting, templates, doctors, hospitals, and lab workflow control.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
              <ScienceOutlinedIcon />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                2026 lab operations console
              </Typography>
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sign in with your assigned lab account.
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  {error ? <Alert severity="error">{error}</Alert> : null}
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    size="large"
                    sx={{ minHeight: 48 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
                  </Button>
                </Stack>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

