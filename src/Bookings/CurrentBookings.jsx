import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";

const CurrentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [hospital, setHospital] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [open, setOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemNames, setItemNames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDoctor("");
    setHospital("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedItem("");
    setNewBookingData({
      patientName: "",
      age: "",
      sex: "",
      referralDoctor: [],
      phone: "",
      hospital: [],
      date: "",
      clinicalDiagnosis: "",
      clinicalHistory: "",
      additionalInfo: [],
      typeOfSpecimen: {},
    });
  };

  // Function to handle form changes
  const handleInputChange = (event) => {
    setNewBookingData({
      ...newBookingData,
      [event.target.name]: event.target.value,
    });
  };

  // Function to handle selection changes
  const handleSelectDoctor = (singleDoctor) => {
    setDoctor(singleDoctor);
  };
  const handleSelectHospital = (singleHospital) => {
    setHospital(singleHospital);
  };

  const handleChange = (event) => {
    setNewBookingData({
      ...newBookingData,
      sex: event.target.value,
    });
  };

  const fetchHospitalsAndDoctors = async () => {
    try {
      const hospitalsQuery = query(
        collection(db, "thirdparty"),
        where("type", "==", "hospital")
      );
      const doctorsQuery = query(
        collection(db, "thirdparty"),
        where("type", "==", "doctor")
      );

      const hospitalsSnapshot = await getDocs(hospitalsQuery);
      const doctorsSnapshot = await getDocs(doctorsQuery);

      const hospitals = hospitalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const doctors = doctorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the fetched data to state or use it as needed
      setHospitals(hospitals);
      setDoctors(doctors);
    } catch (error) {
      console.error("Error fetching hospitals and doctors:", error);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    fetchSubcategories(value.id);
  };

  const handleSubcategoryChange = (value) => {
    setSelectedSubcategory(value);
    fetchItemNames(value.id);
  };

  const handleItemNameChange = (value) => {
    setSelectedItem(value);
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesQuery);
      setCategories(
        categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (id) => {
    if (id) {
      try {
        const subcategoriesRef = collection(
          db,
          "categories",
          id,
          "subcategories"
        );
        const subcategoriesSnapshot = await getDocs(subcategoriesRef);
        const subcategories = subcategoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubcategories(subcategories);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    }
  };

  const fetchItemNames = async (id) => {
    if (id) {
      try {
        const itemNamesRef = collection(
          db,
          "categories",
          selectedCategory.id,
          "subcategories",
          id,
          "itemNames"
        );
        const itemNamesSnapshot = await getDocs(itemNamesRef);
        const itemNames = itemNamesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItemNames(itemNames);
      } catch (error) {
        console.error("Error fetching item names:", error);
      }
    }
  };

  // Call the fetch functions in your component's effect or when needed
  useEffect(() => {
    fetchHospitalsAndDoctors();
    fetchCategories();
  }, []);

  const handleAddBooking = async () => {
    try {
      setIsLoading(true);
      // Validate required fields
      if (!newBookingData.patientName || !newBookingData.date) {
        throw new Error("Please fill in Patient Name and Date fields.");
      }

const statesInfo = [
  {
    state: "received",
    stateName: "Received",
    isDone: true,
    updatedAt: new Date(), // Assuming you have a serverTimestamp function
  },
  {
    state: "grossed",
    stateName: "Grossed",
    isDone: false,
    updatedAt: null,
  },
  {
    state: "slideDelivered",
    stateName: "Slide Delivered",
    isDone: false,
    updatedAt: null,
  },
  {
    state: "resultEntered",
    stateName: "Result Entered",
    isDone: false,
    updatedAt: null,
  },
  {
    state: "resultAuthorized",
    stateName: "Result Authorized",
    isDone: false,
    updatedAt: null,
  },
];

      const bookingData = {
        ...newBookingData,
        referralDoctor: doctor,
        hospital,
        isCompleted: false,
        createdAt: serverTimestamp(),
        statesInfo,
        typeOfSpecimen: {
          category: selectedCategory.name,
          subcategory: selectedSubcategory.name,
          itemName: selectedItem,
        },
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      setBookings((prevBookings) => [bookingData, ...prevBookings]);

      // Handle success
      setIsLoading(false);
      handleClose();
      console.log("Booking added successfully with ID:", docRef.id);
    } catch (error) {
      // Handle errors gracefully
      console.error("Error adding booking:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetching
        const q = query(
          collection(db, "bookings"),
          where("isCompleted", "==", false),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchBookings();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredBookings = searchQuery
    ? bookings.filter((booking) =>
        booking.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookings;

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
              value={searchQuery}
              onChange={handleSearch}
              //   label="Search"
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
              // sx={{ mb: 2 }}
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
              disabled={isLoading}
              onClick={() => handleClickOpen()}
            >
              {isLoading ? <CircularProgress size={24} /> : "Add New Booking"}
              {/* Add New Booking */}
            </Button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : bookings.length > 0 ? (
        <BookingsTable bookings={filteredBookings} isCurrent={true} />
      ) : (
        <p>No bookings found.</p>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill in the following details to add a new booking.
          </DialogContentText>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
            <TextField
              sx={{ mt: 2 }}
              label="Patient Name"
              name="patientName"
              value={newBookingData.patientName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              sx={{ mt: 2 }}
              label="Patient Age"
              name="age"
              value={newBookingData.age}
              onChange={handleInputChange}
              fullWidth
              required
            />
            {/* <TextField
              sx={{ mt: 2 }}
              label="Patient Sex"
              name="sex"
              value={newBookingData.sex}
              onChange={handleInputChange}
              fullWidth
              required
            /> */}
            <RadioGroup
              row
              name="controlled-radio-buttons-group"
              value={newBookingData.sex}
              onChange={handleChange}
            >
              <FormControlLabel
                value="male"
                control={<Radio />}
                label="Male"
              />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
            <FormControl sx={{ mt: 2 }} fullWidth>
              <InputLabel id="hospital-label">Hospital</InputLabel>
              <Select
                labelId="hospital-label"
                name="hospital"
                value={hospital}
                onChange={(e) => handleSelectHospital(e.target.value)}
              >
                {hospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital}>
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }} fullWidth>
              <InputLabel id="referralDoctor-label">Referral Doctor</InputLabel>
              <Select
                labelId="referralDoctor-label"
                name="referralDoctor"
                value={doctor}
                onChange={(e) => handleSelectDoctor(e.target.value)}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              sx={{ mt: 2 }}
              label="Phone Number"
              name="phone"
              value={newBookingData.phone}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              sx={{ mt: 2 }}
              label="Date"
              type="date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={newBookingData.date}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              sx={{ mt: 2 }}
              label="Clinical Diagnosis"
              name="clinicalDiagnosis"
              value={newBookingData.clinicalDiagnosis}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              sx={{ mt: 2 }}
              label="Relevant Clinical History"
              name="clinicalHistory"
              value={newBookingData.clinicalHistory}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <FormControl sx={{ mt: 2 }} fullWidth>
              <InputLabel id="catgory-label">Specimen Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                labelId="category-label"
                name="category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }} fullWidth>
              <InputLabel id="subcategory-label">
                Specimen Sub Category
              </InputLabel>
              <Select
                // sx={{ mt: 2 }}
                value={selectedSubcategory}
                disabled={!selectedCategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                labelId="subcategory-label"
                name="subcategory"
              >
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }} fullWidth>
              <InputLabel id="itemName-label">Specimen Item Name</InputLabel>
              <Select
                value={selectedItem}
                disabled={!selectedSubcategory}
                onChange={(e) => handleItemNameChange(e.target.value)}
                labelId="itemName-label"
                name="itemName"
              >
                {itemNames.map((itemName) => (
                  <MenuItem key={itemName.id} value={itemName.name}>
                    {itemName.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* ... additional fields for additionalInfo and typeOfSpecimen */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBooking}>
            {isLoading ? <CircularProgress size={24} /> : "Add New Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CurrentBookings;
