import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputAdornment,
} from "@mui/material";
import { collection, addDoc, getDocs, onSnapshot, where, query } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import ThirdpartyTable from "./ThirdpartyTable";
import { Search } from "@mui/icons-material";
import { getFunctions, httpsCallable } from "firebase/functions";


const ThirdPartyHospitals = () => {
  const functions = getFunctions();
  const createThirdParty = httpsCallable(functions, "createThirdParty");

  const [thirdParties, setThirdParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addThirdPartyDialogOpen, setAddThirdPartyDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("hospital");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [teamMembers, setTeamMembers] = useState([]); // Array of names
  const [searchTerm, setSearchTerm] = useState("");


  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleOpenAddThirdPartyDialog = () => {
    setAddThirdPartyDialogOpen(true);
  };

  const handleCloseAddThirdPartyDialog = () => {
    setAddThirdPartyDialogOpen(false);
    setName("");
    setType("");
    setAddress("");
    setEmail("");
    setPassword("");
    setPhone("");
    setTeamMembers([]);
  };

  const handleSaveThirdParty = async () => {
    try {
      setLoading(true);
      const thirdPartyData = {
        name,
        type: "hospital",
        address,
        email,
        phone,
        teamMembers,
        role: "thirdparty",
      };
      // await addDoc(collection(db, "thirdparty"), thirdPartyData);
      createThirdParty({ email, password, name, role: "thirdparty", type, address, phone, teamMembers })
        .then((result) => {
          console.log("User created:", result.data);
          // handleCloseAddThirdPartyDialog();
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        });
      setThirdParties((prevThirdParties) => [
        ...prevThirdParties,
        thirdPartyData,
      ]); // Update table
      handleCloseAddThirdPartyDialog();
    } catch (error) {
      console.error("Error adding third party:", error);
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    setType(event.target.value);
  };

  useEffect(() => {
    const q = query(
      collection(db, "thirdparty"),
      where("type", "==", "hospital")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredThirdParties = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return (
          data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // data.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.teamMembers.some((member) =>
            member.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      });
      setThirdParties(
        filteredThirdParties.map((doc) => ({ ...doc.data(), id: doc.id }))
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]);

  return (
    <div>
      <div
        style={{
          // width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
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
              label="Search"
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
              onClick={() => handleOpenAddThirdPartyDialog()}
            >
              {loading ? <CircularProgress size={24} /> : "Add Hospital/Clinic"}
            </Button>
          </div>
        </div>
      </div>

      {/* ... Add Third Party Dialog (similar to UserTable) */}
      <Dialog
        open={addThirdPartyDialogOpen}
        onClose={handleCloseAddThirdPartyDialog}
        // style={{ width: "50vw" }}
      >
        <DialogTitle>Add Hospital/Clinic</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "10px",
            alignItems: "center",
            width: "50vw",
            maxWidth: "600px",
          }}
        >
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          {/* <TextField
            error={type === ""}
            style={{ marginBottom: "10px" }}
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            helperText="hospital or doctor"
          /> */}
          {/* <RadioGroup
            row
            name="controlled-radio-buttons-group"
            value={type}
            onChange={handleChange}
          >
            <FormControlLabel
              value="doctor"
              control={<Radio />}
              label="Doctor"
            />
            <FormControlLabel
              value="hospital"
              control={<Radio />}
              label="Hospital"
            />
          </RadioGroup> */}
          <TextField
            style={{ marginBottom: "10px" }}
            label="Address"
            value={address}
            multiline
            rows={2}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />
          <TextField
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
          <TextField
            style={{ marginBottom: "10px" }}
            label="Phone"
            type="number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <TextField
            style={{ marginBottom: "10px" }}
            label="Team Members (comma-separated)"
            value={teamMembers.join(", ")}
            onChange={(e) => {
              setTeamMembers(
                e.target.value.split(",").map((name) => name.trim())
              );
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddThirdPartyDialog}>Cancel</Button>
          <Button
            disabled={name.trim() === "" || email.trim() === ""}
            onClick={handleSaveThirdParty}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!loading ? (
          <ThirdpartyTable thirdParties={thirdParties} />
        ) : (
          <CircularProgress size={54} />
        )}
      </div>
    </div>
  );
};

export default ThirdPartyHospitals;
