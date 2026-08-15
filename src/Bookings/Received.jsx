import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import { formatDisplayDate } from "../utils/dateFormat";
import { buildWorkflowEvent } from "../utils/workflowAudit";

const emptyForm = {
  patientName: "",
  age: "",
  sex: "",
  phone: "",
  referralDoctorName: "",
  hospitalName: "",
  clinicalDiagnosis: "",
  clinicalHistory: "",
};

const Received = ({ bookingData, handleUpdateStatesInfo, statesInfo = [] }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setForm({
      patientName: bookingData?.patientName || "",
      age: bookingData?.age || "",
      sex: bookingData?.sex || "",
      phone: bookingData?.phone || "",
      referralDoctorName: bookingData?.referralDoctor?.name || "",
      hospitalName: bookingData?.hospital?.name || "",
      clinicalDiagnosis: bookingData?.clinicalDiagnosis || "",
      clinicalHistory: bookingData?.clinicalHistory || "",
    });
  }, [bookingData]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      const updatedStatesInfo = statesInfo.map((state) =>
        state.state === "received"
          ? { ...state, isDone: true, updatedAt: new Date() }
          : state
      );

      await updateDoc(doc(db, "bookings", bookingData.id), {
        patientName: form.patientName.trim(),
        age: form.age,
        sex: form.sex,
        phone: form.phone.trim(),
        referralDoctor: {
          ...(bookingData?.referralDoctor || {}),
          name: form.referralDoctorName.trim(),
        },
        hospital: {
          ...(bookingData?.hospital || {}),
          name: form.hospitalName.trim(),
        },
        clinicalDiagnosis: form.clinicalDiagnosis,
        clinicalHistory: form.clinicalHistory,
        statesInfo: updatedStatesInfo,
        workflowHistory: arrayUnion(
          buildWorkflowEvent({
            step: "received",
            action: "Received details saved",
            user,
          })
        ),
      });

      handleUpdateStatesInfo?.(updatedStatesInfo);
      setMessage({ severity: "success", text: "Received details saved." });
    } catch (error) {
      console.error("Error saving received details:", error);
      setMessage({ severity: "error", text: "Received details could not be saved." });
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    form.patientName.trim() !== "" && form.age !== "" && form.sex !== "";

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Received Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Booking date: {formatDisplayDate(bookingData?.bookingDate)}
      </Typography>

      {message ? (
        <Alert severity={message.severity} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField required label="Patient Name" value={form.patientName} onChange={updateForm("patientName")} fullWidth />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField required label="Age" value={form.age} onChange={updateForm("age")} fullWidth />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField required select label="Sex" value={form.sex} onChange={updateForm("sex")} fullWidth>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Referring Doctor" value={form.referralDoctorName} onChange={updateForm("referralDoctorName")} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Hospital" value={form.hospitalName} onChange={updateForm("hospitalName")} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Phone" value={form.phone} onChange={updateForm("phone")} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Clinical Diagnosis" value={form.clinicalDiagnosis} onChange={updateForm("clinicalDiagnosis")} fullWidth multiline minRows={3} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Clinical History" value={form.clinicalHistory} onChange={updateForm("clinicalHistory")} fullWidth multiline minRows={3} />
        </Grid>
      </Grid>

      <Button variant="contained" disabled={!canSave || isSaving} onClick={handleSave} sx={{ mt: 2 }}>
        {isSaving ? <CircularProgress size={20} color="inherit" /> : "Save Received Details"}
      </Button>
    </Paper>
  );
};

export default Received;
