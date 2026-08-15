import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Search } from "@mui/icons-material";
import { db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import UserTable from "./UserTable";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  role: "technician",
};

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalize = (value) => String(value || "").toLowerCase().trim();

const UsersAndPermissions = () => {
  const functions = getFunctions();
  const createUser = httpsCallable(functions, "createUser");
  const { authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setUsersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = normalize(searchTerm);

    return users.filter((user) => {
      const active = isActiveRecord(user);
      if (!showInactive && !active) return false;
      if (!term) return true;

      return [user.fullName, user.email, user.role]
        .map(normalize)
        .some((value) => value.includes(term));
    });
  }, [searchTerm, showInactive, users]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "technician",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setForm(emptyForm);
  };

  const saveUser = async () => {
    try {
      setSaving(true);

      if (selectedUser) {
        await updateDoc(doc(db, "users", selectedUser.id), {
          fullName: form.fullName.trim(),
          role: form.role,
          updatedAt: serverTimestamp(),
        });
        setFeedback({ severity: "success", message: "User updated." });
      } else {
        await createUser({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role,
        });
        setFeedback({ severity: "success", message: "User created." });
      }

      closeDialog();
    } catch (error) {
      console.error(error);
      setFeedback({ severity: "error", message: "User could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const deactivateUser = async (user) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "User deactivated." });
    } catch (error) {
      console.error(error);
      setFeedback({ severity: "error", message: "User could not be deactivated." });
    }
  };

  const restoreUser = async (user) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        active: true,
        archivedAt: null,
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "User restored." });
    } catch (error) {
      console.error(error);
      setFeedback({ severity: "error", message: "User could not be restored." });
    }
  };

  const isEdit = Boolean(selectedUser);
  const canSave =
    form.fullName.trim() !== "" &&
    form.role.trim() !== "" &&
    (isEdit || (form.email.trim() !== "" && form.password.trim() !== ""));

  return (
    <div>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 2 }}
      >
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          label="Search users"
          type="search"
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
            />
          }
          label="Show inactive"
          sx={{ whiteSpace: "nowrap" }}
        />
        <Button variant="contained" disabled={saving} onClick={openCreateDialog}>
          {saving ? <CircularProgress size={24} color="inherit" /> : "Add User"}
        </Button>
      </Stack>

      {!usersLoading ? (
        <UserTable
          users={filteredUsers}
          currentUid={authUser?.uid}
          onEdit={openEditDialog}
          onArchive={deactivateUser}
          onRestore={restoreUser}
        />
      ) : (
        <CircularProgress size={54} />
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            required
            label="Name"
            value={form.fullName}
            onChange={updateForm("fullName")}
            fullWidth
          />
          <TextField
            required
            label="Email"
            value={form.email}
            onChange={updateForm("email")}
            type="email"
            fullWidth
            disabled={isEdit}
            helperText={isEdit ? "Login email cannot be changed here." : ""}
          />
          {!isEdit ? (
            <TextField
              required
              label="Password"
              value={form.password}
              onChange={updateForm("password")}
              type="password"
              fullWidth
            />
          ) : null}
          <FormControl>
            <FormLabel>Role</FormLabel>
            <RadioGroup row value={form.role} onChange={updateForm("role")}>
              <FormControlLabel value="technician" control={<Radio />} label="Technician" />
              <FormControlLabel value="receptionist" control={<Radio />} label="Receptionist" />
              <FormControlLabel value="admin" control={<Radio />} label="Admin" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={!canSave || saving} onClick={saveUser}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3200}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback ? (
          <Alert onClose={() => setFeedback(null)} severity={feedback.severity} sx={{ width: "100%" }}>
            {feedback.message}
          </Alert>
        ) : null}
      </Snackbar>
    </div>
  );
};

export default UsersAndPermissions;
