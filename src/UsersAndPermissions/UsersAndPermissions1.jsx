import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import UserTable from "./UserTable";
import { getFunctions, httpsCallable } from "firebase/functions";

const UsersAndPermissions = () => {
  const functions = getFunctions();
  const createUser = httpsCallable(functions, "createUser");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("technician");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setUsersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAddUserDialog = () => {
    setAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      const userData = {
        fullName,
        email,
        role,
      };
      createUser({ email, password, fullName, role })
        .then((result) => {
          console.log("User created:", result.data);
          handleCloseAddUserDialog();
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        });

      setUsers((prevUsers) => [...prevUsers, { fullName, email, role }]); // Update table
      handleCloseAddUserDialog();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    setRole(event.target.value);
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flex: "1", justifyContent: "end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={() => handleOpenAddUserDialog()}
          >
            {loading ? <CircularProgress size={24} /> : "Add User"}
          </Button>
        </div>
      </div>

      <Dialog open={addUserDialogOpen} onClose={handleCloseAddUserDialog}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "10px",
            alignItems: "center",
          }}
        >
          <TextField
            error={fullName === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={fullName}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            error={email === ""}
            style={{ marginBottom: "10px" }}
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            fullWidth
          />
          <TextField
            error={password === ""}
            style={{ marginBottom: "10px" }}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            fullWidth
          />
          <RadioGroup
            row
            name="controlled-radio-buttons-group"
            value={role}
            onChange={handleChange}
          >
            <FormControlLabel
              value="technician"
              control={<Radio />}
              label="Technician"
            />
            <FormControlLabel
              value="receptionist"
              control={<Radio />}
              label="Receptionist"
            />
            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUserDialog}>Cancel</Button>
          <Button
            disabled={
              fullName.trim() === "" ||
              email.trim() === "" ||
              password.trim() === ""
            }
            onClick={handleSaveUser}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!usersLoading ? (
          <UserTable users={users} />
        ) : (
          <CircularProgress size={54} />
        )}
      </div>
    </div>
  );
};

export default UsersAndPermissions;
