import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import { Search } from "@mui/icons-material";
import { useTheme } from "@emotion/react";

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDoctorDialogOpen, setAddDoctorDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();

  // Fetch only doctors from the "thirdparty" collection with type "doctor"
  useEffect(() => {
    const q = query(
      collection(db, "thirdparty"),
      where("type", "==", "doctor"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filteredDoctors = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.name.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setDoctors(filteredDoctors.map((doc) => ({ ...doc.data(), id: doc.id })));

      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleOpenAddDoctorDialog = () => {
    setAddDoctorDialogOpen(true);
  };

  const handleCloseAddDoctorDialog = () => {
    setAddDoctorDialogOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleSaveDoctor = async () => {
    try {
      setLoading(true);
      const doctorData = {
        name,
        email,
        phone,
        type: "doctor", // Explicitly set type
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "thirdparty"), doctorData);
      const updatedDoctors = await getDocs(
        query(
          collection(db, "thirdparty"),
          where("type", "==", "doctor"),
          orderBy("createdAt", "desc")
        )
      );
      setDoctors(
        updatedDoctors.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      handleCloseAddDoctorDialog();
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextField
            value={searchTerm}
            onChange={handleSearch}
            type="search"
            label="Search"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ margin: "10px 0px" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleOpenAddDoctorDialog}
          >
            {loading ? <CircularProgress size={24} /> : "Add Doctor"}
          </Button>
        </div>
      </div>

      <Dialog open={addDoctorDialogOpen} onClose={handleCloseAddDoctorDialog}>
        <DialogTitle>Add Doctor</DialogTitle>
        <DialogContent>
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            error={email === ""}
            style={{ marginBottom: "10px" }}
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            error={phone === ""}
            style={{ marginBottom: "10px" }}
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDoctorDialog}>Cancel</Button>
          <Button
            disabled={
              name.trim() === "" || email.trim() === "" || phone.trim() === ""
            }
            onClick={handleSaveDoctor}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!loading && doctors.length > 0 ? (
          <Grid container spacing={2}>
            {doctors.map((doctor) => (
              <Grid item xs={3} key={doctor.id}>
                <Card
                  sx={{ borderLeft: `${theme.palette.primary.main} 5px solid` }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        overflowWrap: "break-word",
                      }}
                      variant="h6"
                    >
                      {doctor.name}
                    </Typography>
                    {/* You can add more content to the card based on your doctor data */}
                    <Typography variant="body2">{doctor.email}</Typography>
                    <Typography variant="body2">{doctor.phone}</Typography>
                    {/* Add more doctor fields as needed */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <p>
            {loading ? <CircularProgress size={54} /> : "No doctors found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Doctor;