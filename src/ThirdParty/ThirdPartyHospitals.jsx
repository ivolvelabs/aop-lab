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
  address: "",
  email: "",
  password: "",
  phone: "",
  teamMembers: "",
};

const emptyCredentialForm = {
  email: "",
  password: "",
};

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalizeSearch = (value) => String(value || "").toLowerCase().trim();

const parseTeamMembers = (value) =>
  value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

const ThirdPartyHospitals = () => {
  const functions = getFunctions();
  const createThirdParty = httpsCallable(functions, "createThirdParty");
  const attachThirdPartyLogin = httpsCallable(functions, "attachThirdPartyLogin");
  const resetThirdPartyPassword = httpsCallable(functions, "resetThirdPartyPassword");
  const setThirdPartyLoginAccess = httpsCallable(functions, "setThirdPartyLoginAccess");

  const [thirdParties, setThirdParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
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
      where("type", "==", "hospital")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setThirdParties(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredThirdParties = useMemo(() => {
    const term = normalizeSearch(searchTerm);

    return thirdParties.filter((thirdParty) => {
      const active = isActiveRecord(thirdParty);
      if (!showArchived && !active) return false;
      if (!term) return true;

      return [
        thirdParty.name,
        thirdParty.address,
        thirdParty.email,
        thirdParty.phone,
        ...(Array.isArray(thirdParty.teamMembers) ? thirdParty.teamMembers : []),
      ]
        .map(normalizeSearch)
        .some((value) => value.includes(term));
    });
  }, [thirdParties, searchTerm, showArchived]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreateDialog = () => {
    setSelectedHospital(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (hospital) => {
    setSelectedHospital(hospital);
    setForm({
      name: hospital?.name || "",
      address: hospital?.address || "",
      email: hospital?.email || "",
      password: "",
      phone: hospital?.phone || "",
      teamMembers: Array.isArray(hospital?.teamMembers)
        ? hospital.teamMembers.join(", ")
        : "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedHospital(null);
    setForm(emptyForm);
  };

  const openCredentialDialog = (hospital, mode) => {
    setCredentialTarget(hospital);
    setCredentialMode(mode);
    setCredentialForm({
      email: hospital?.email || "",
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

  const saveHospital = async () => {
    const teamMembers = parseTeamMembers(form.teamMembers);

    try {
      setSaving(true);

      if (selectedHospital) {
        await updateDoc(doc(db, "thirdparty", selectedHospital.id), {
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          teamMembers,
          updatedAt: serverTimestamp(),
        });
        setFeedback({ severity: "success", message: "Hospital/clinic updated." });
      } else {
        await createThirdParty({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: "thirdparty",
          type: "hospital",
          address: form.address.trim(),
          phone: form.phone.trim(),
          teamMembers,
        });
        setFeedback({
          severity: "success",
          message: "Hospital/clinic login account created.",
        });
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving third party:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Hospital/clinic could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  const archiveHospital = async (hospital) => {
    try {
      if (hospital.authUid && hospital.loginAccess !== false) {
        await setThirdPartyLoginAccess({
          thirdPartyId: hospital.id,
          loginAccess: false,
        });
      }
      await updateDoc(doc(db, "thirdparty", hospital.id), {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Hospital/clinic archived." });
    } catch (error) {
      console.error("Error archiving third party:", error);
      setFeedback({
        severity: "error",
        message: "Hospital/clinic could not be archived.",
      });
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
        setFeedback({ severity: "success", message: "Hospital/clinic login created." });
      } else {
        await resetThirdPartyPassword({
          thirdPartyId: credentialTarget.id,
          password: credentialForm.password,
        });
        setFeedback({ severity: "success", message: "Hospital/clinic password reset." });
      }

      closeCredentialDialog();
    } catch (error) {
      console.error("Error saving hospital credentials:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Hospital/clinic credentials could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleHospitalLogin = async (hospital, loginAccess) => {
    try {
      setSaving(true);
      await setThirdPartyLoginAccess({
        thirdPartyId: hospital.id,
        loginAccess,
      });
      setFeedback({
        severity: "success",
        message: loginAccess
          ? "Hospital/clinic login enabled."
          : "Hospital/clinic login disabled.",
      });
    } catch (error) {
      console.error("Error updating hospital login access:", error);
      setFeedback({
        severity: "error",
        message: error?.message || "Hospital/clinic login access could not be updated.",
      });
    } finally {
      setSaving(false);
    }
  };

  const restoreHospital = async (hospital) => {
    try {
      await updateDoc(doc(db, "thirdparty", hospital.id), {
        active: true,
        archivedAt: null,
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Hospital/clinic restored." });
    } catch (error) {
      console.error("Error restoring third party:", error);
      setFeedback({
        severity: "error",
        message: "Hospital/clinic could not be restored.",
      });
    }
  };

  const isEdit = Boolean(selectedHospital);
  const canSave =
    form.name.trim() !== "" &&
    (isEdit || (form.email.trim() !== "" && form.password.trim() !== ""));

  return (
    <div>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ my: 2 }}
      >
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          label="Search hospitals"
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
          sx={{ minWidth: 190 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Add Hospital/Clinic"}
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress size={54} />
      ) : (
        <ThirdpartyTable
          kind="hospital"
          thirdParties={filteredThirdParties}
          onEdit={openEditDialog}
          onArchive={archiveHospital}
          onRestore={restoreHospital}
          onCreateLogin={(hospital) => openCredentialDialog(hospital, "create")}
          onResetPassword={(hospital) => openCredentialDialog(hospital, "reset")}
          onToggleLogin={toggleHospitalLogin}
        />
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit Hospital/Clinic" : "Add Hospital/Clinic"}</DialogTitle>
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
            label="Address"
            value={form.address}
            multiline
            rows={2}
            onChange={updateForm("address")}
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
            label="Phone"
            value={form.phone}
            onChange={updateForm("phone")}
            fullWidth
          />
          <TextField
            label="Team Members (comma-separated)"
            value={form.teamMembers}
            onChange={updateForm("teamMembers")}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={!canSave || saving} onClick={saveHospital}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={credentialDialogOpen} onClose={closeCredentialDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {credentialMode === "create"
            ? "Create Hospital/Clinic Login"
            : "Reset Hospital/Clinic Password"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Alert severity={credentialMode === "create" ? "info" : "warning"}>
            {credentialMode === "create"
              ? `Create login access for ${credentialTarget?.name || "this hospital/clinic"}.`
              : `Set a new password for ${credentialTarget?.name || "this hospital/clinic"}.`}
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

export default ThirdPartyHospitals;
