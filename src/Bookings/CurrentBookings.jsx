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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";

const CurrentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [open, setOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState([]);
  const [itemNames, setItemNames] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");


const handleClickOpen = () => {
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setNewBookingData({
    patientName: "",
    age: "",
    sex: "",
    referralDoctor: "",
    phone: "",
    hospital: "",
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
const handleSelectChange = (event) => {
  setNewBookingData({
    ...newBookingData,
    [event.target.name]: event.target.value,
  });
};



const handleCategoryChange = (event) => {
  setSelectedCategoryName(event.target.value);
};

const handleSubcategoryChange = (event) => {
  setSelectedSubcategoryName(event.target.value);
};

const handleItemNameChange = (event) => {
  setSelectedItemName(event.target.value);
};


const fetchHospitalsAndDoctors = async () => {
  try {
    const hospitalsQuery = query(collection(db, "thirdparty"), where("type", "==", "hospital"));
    const doctorsQuery = query(collection(db, "thirdparty"), where("type", "==", "doctor"));

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

const fetchCategoriesWithSubcollections = async () => {
  try {
    const categoriesQuery = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesQuery);

    const categories = categoriesSnapshot.docs.map(async(doc) => {
      const categoryData = doc.data();
      const subcategoriesRef = collection(doc.ref, "subcategories");
      const subcategoriesSnapshot = await getDocs(subcategoriesRef);

      const fetchedSubcategories = subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        itemNames: [],
      }));

      for (const subcategory of fetchedSubcategories) {
        const itemNamesRef = collection(subcategoriesRef, doc.id, "itemNames");
        const itemNamesSnapshot = await getDocs(itemNamesRef);

        subcategory.itemNames = itemNamesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      return {
        id: doc.id,
        ...categoryData,
        subcategories: fetchedSubcategories,
      };
    });

    // Update state for both subcategories and itemNames
    setSubcategories(categories.map((category) => category.subcategories));
    setItemNames(categories.map((category) => category.subcategories.map((subcategory) => subcategory.itemNames)));
  } catch (error) {
    console.error("Error fetching categories with subcollections:", error);
  }
};

// Call the fetch functions in your component's effect or when needed
useEffect(() => {
  fetchHospitalsAndDoctors();
  fetchCategoriesWithSubcollections();
}, []);

// Call the fetch functions in your component's effect or when needed
useEffect(() => {
  fetchHospitalsAndDoctors();
  fetchCategoriesWithSubcollections();
}, []);


const handleAddBooking = async () => {
  try {
    // Validate required fields
    if (!newBookingData.patientName || !newBookingData.date) {
      throw new Error("Please fill in Patient Name and Date fields.");
    }

    // Add booking data to Firestore (assuming you have Firebase set up)
    const docRef = await addDoc(collection(db, "bookings"), {
      ...newBookingData,
      isCompleted: false, // Set initial state as "Received"
      createdAt: new Date().getTime(),
      state: "received",
      typeOfSpecimen: {
        category: selectedCategoryName,
        subcategory: selectedSubcategoryName,
        itemName: selectedItemName,
      }, // Timestamp for creation
    });

    // Handle success
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
          where("isCompleted", "==" ,false)
        );
        const snapshot = await getDocs(q);
        console.log(snapshot.docs);
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
                disabled={loading}
                onClick={() => handleOpenAddThirdPartyDialog()}
            >
              {/* {loading ? <CircularProgress size={24} /> : "Add New Booking"} */}
              Add New Booking
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
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Patient Name"
              name="patientName"
              value={newBookingData.patientName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="referralDoctor-label">Referral Doctor</InputLabel>
              <Select
                labelId="referralDoctor-label"
                name="referralDoctor"
                value={newBookingData.referralDoctor}
                onChange={handleSelectChange}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone Number"
              name="phone"
              value={newBookingData.phone}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Hospital Name"
              name="hospital"
              value={newBookingData.hospital}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
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
              label="Clinical Diagnosis"
              name="clinicalDiagnosis"
              value={newBookingData.clinicalDiagnosis}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Relevant Clinical History"
              name="clinicalHistory"
              value={newBookingData.clinicalHistory}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <Select
              label="Category"
              value={selectedCategoryName}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Subcategory"
              value={selectedSubcategoryName}
              onChange={handleSubcategoryChange}
              disabled={!selectedCategoryName} // Disable if no category selected
            >
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.name}>
                  {subcategory.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Item"
              value={selectedItemName}
              onChange={handleItemNameChange}
              disabled={!selectedSubcategoryName} // Disable if no subcategory selected
            >
              {itemNames.map((itemName) => (
                <MenuItem key={itemName.id} value={itemName.name}>
                  {itemName.name}
                </MenuItem>
              ))}
            </Select>
            {/* ... additional fields for additionalInfo and typeOfSpecimen */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBooking}>
            Add Booking
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CurrentBookings;
