import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Search } from "@mui/icons-material";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase";
import ThirdpartyTable from "./ThirdpartyTable";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const emptyCredentialForm = {
  email: "",
  password: "",
};

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalizeSearch = (value) => String(value || "").toLowerCase().trim();

const Doctors = () => {
  const functions = getFunctions();
  const createThirdParty = httpsCallable(functions, "createThirdParty");
  const attachThirdPartyLogin = httpsCallable(functions, "attachThirdPartyLogin");
  const resetThirdPartyPassword = httpsCallable(functions, "resetThirdPartyPassword");
  const setThirdPartyLoginAccess = httpsCallable(functions, "setThirdPartyLoginAccess");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [credentialMode, setCredentialMode] = useState("create");
  const [credentialTarget, setCredentialTarget] = useState(null);
  const [credentialForm, setCredentialForm] = useState(emptyCredentialForm);

  useEffect(() => {
    const q = query(
      collection(db, "thirdparty"),
      where("type", "==", "doctor"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setDoctors(querySnapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = normalizeSearch(searchTerm);

    return doctors.filter((doctor) => {
      const active = isActiveRecord(doctor);
      if (!showArchived && !active) return false;
      if (!term) return true;

      return [doctor.name, doctor.email, doctor.phone]
        .map(normalizeSearch)
        .some((value) => value.includes(term));
    });
  }, [doctors, searchTerm, showArchived]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreateDialog = () => {
    setSelectedDoctor(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setForm({
      name: doctor?.name || "",
      email: doctor?.email || "",
      password: "",
      phone: doctor?.phone || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedDoctor(null);
    setForm(emptyForm);
  };

  const openCredentialDialog = (doctor, mode) => {
    setCredentialTarget(doctor);
    setCredentialMode(mode);
    setCredentialForm({
      email: doctor?.email || "",
      password: "",
    });
    setCredentialDialogOpen(true);
  };

  const closeCredentialDialog = () => {
    setCredentialDialogOpen(false);
    setCredentialTarget(null);
    setCredentialForm(emptyCredentialForm);
  };

  const updateCredentialForm = (field) => (event) => {
    setCredentialForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const saveDoctor = async () => {
    try {
      setSaving(true);

      if (selectedDoctor) {
        await updateDoc(doc(db, "thirdparty", selectedDoctor.id), {
          name: form.name.trim(),
          phone: form.phone.trim(),
          updatedAt: serverTimestamp(),
        });
        setFeedback({ severity: "success", message: "Doctor updated." });
      } else {
        await createThirdParty({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          role: "thirdparty",
          type: "doctor",
        });
        setFeedback({
          severity: "success",
          message: "Doctor login account created.",
        });
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving doctor:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Doctor could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  const archiveDoctor = async (doctor) => {
    try {
      if (doctor.authUid && doctor.loginAccess !== false) {
        await setThirdPartyLoginAccess({
          thirdPartyId: doctor.id,
          loginAccess: false,
        });
      }
      await updateDoc(doc(db, "thirdparty", doctor.id), {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Doctor archived." });
    } catch (error) {
      console.error("Error archiving doctor:", error);
      setFeedback({ severity: "error", message: "Doctor could not be archived." });
    }
  };

  const saveCredentials = async () => {
    if (!credentialTarget?.id) return;

    try {
      setSaving(true);

      if (credentialMode === "create") {
        await attachThirdPartyLogin({
          thirdPartyId: credentialTarget.id,
          email: credentialForm.email.trim(),
          password: credentialForm.password,
        });
        setFeedback({ severity: "success", message: "Doctor login created." });
      } else {
        await resetThirdPartyPassword({
          thirdPartyId: credentialTarget.id,
          password: credentialForm.password,
        });
        setFeedback({ severity: "success", message: "Doctor password reset." });
      }

      closeCredentialDialog();
    } catch (error) {
      console.error("Error saving doctor credentials:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Doctor credentials could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDoctorLogin = async (doctor, loginAccess) => {
    try {
      setSaving(true);
      await setThirdPartyLoginAccess({
        thirdPartyId: doctor.id,
        loginAccess,
      });
      setFeedback({
        severity: "success",
        message: loginAccess ? "Doctor login enabled." : "Doctor login disabled.",
      });
    } catch (error) {
      console.error("Error updating doctor login access:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Doctor login access could not be updated.",
      });
    } finally {
      setSaving(false);
    }
  };

  const restoreDoctor = async (doctor) => {
    try {
      await updateDoc(doc(db, "thirdparty", doctor.id), {
        active: true,
        archivedAt: null,
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Doctor restored." });
    } catch (error) {
      console.error("Error restoring doctor:", error);
      setFeedback({ severity: "error", message: "Doctor could not be restored." });
    }
  };

  const isEdit = Boolean(selectedDoctor);
  const canSave =
    form.name.trim() !== "" &&
    form.phone.trim() !== "" &&
    (isEdit || (form.email.trim() !== "" && form.password.trim() !== ""));

  return (
    <div style={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ my: 2 }}
      >
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          type="search"
          label="Search doctors"
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
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />
          }
          label="Show archived"
          sx={{ whiteSpace: "nowrap" }}
        />
        <Button
          variant="contained"
          disabled={loading}
          onClick={openCreateDialog}
          sx={{ minWidth: 140 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Add Doctor"}
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress size={54} />
      ) : (
        <ThirdpartyTable
          kind="doctor"
          thirdParties={filteredDoctors}
          onEdit={openEditDialog}
          onArchive={archiveDoctor}
          onRestore={restoreDoctor}
          onCreateLogin={(doctor) => openCredentialDialog(doctor, "create")}
          onResetPassword={(doctor) => openCredentialDialog(doctor, "reset")}
          onToggleLogin={toggleDoctorLogin}
        />
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            required
            label="Name"
            value={form.name}
            onChange={updateForm("name")}
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
          <TextField
            required
            label="Phone"
            value={form.phone}
            onChange={updateForm("phone")}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={!canSave || saving} onClick={saveDoctor}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={credentialDialogOpen} onClose={closeCredentialDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {credentialMode === "create" ? "Create Doctor Login" : "Reset Doctor Password"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Alert severity={credentialMode === "create" ? "info" : "warning"}>
            {credentialMode === "create"
              ? `Create login access for ${credentialTarget?.name || "this doctor"}.`
              : `Set a new password for ${credentialTarget?.name || "this doctor"}.`}
          </Alert>
          {credentialMode === "create" ? (
            <TextField
              autoFocus
              required
              label="Login Email"
              value={credentialForm.email}
              onChange={updateCredentialForm("email")}
              type="email"
              fullWidth
            />
          ) : null}
          <TextField
            autoFocus={credentialMode !== "create"}
            required
            label={credentialMode === "create" ? "Initial Password" : "New Password"}
            value={credentialForm.password}
            onChange={updateCredentialForm("password")}
            type="password"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCredentialDialog}>Cancel</Button>
          <Button
            disabled={
              saving ||
              credentialForm.password.trim() === "" ||
              (credentialMode === "create" && credentialForm.email.trim() === "")
            }
            onClick={saveCredentials}
          >
            {saving ? (
              <CircularProgress size={20} />
            ) : credentialMode === "create" ? (
              "Create Login"
            ) : (
              "Reset Password"
            )}
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

export default Doctors;
