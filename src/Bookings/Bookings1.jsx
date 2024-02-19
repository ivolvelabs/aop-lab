import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  AppBar,
  TextField,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  Typography,
  MenuItem,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
} from '@mui/material';
import styled from "@emotion/styled";

import { collection, query, orderBy, onSnapshot, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming your Firestore instance is imported here

const useStyles = styled({
  tableContainer: {
    maxHeight: 440,
  },
}); 

const Bookings = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0); // 0 for Current, 1 for Past
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch bookings based on selected tab (Current or Past)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "bookings"),
        currentTab === 0
          ? where("isCompleted", "==", false) // Incomplete bookings for current tab
          : where("isCompleted", "==", true), // Completed bookings for past tab
        orderBy("date", "desc") // Order by date, latest first
      ),
      (snapshot) => {
        setBookings(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentTab]);




const [selectedCategoryName, setSelectedCategoryName] = useState("");
const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
const [selectedItemName, setSelectedItemName] = useState("");

const [categories, setCategories] = useState([]);
const fetchCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesRef);
    const categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Return an empty array in case of errors
  }
};

useEffect(() => {
  const fetchData = async () => {
    const categories = await fetchCategories();
    setCategories(categories);
  };

  fetchData();
}, []);

const [selectedCategoryId, setSelectedCategoryId] = useState("");
const [subcategories, setSubcategories] = useState([]);

const handleCategoryChange = async (event) => {
  const selectedId = event.target.value;
  setSelectedCategoryId(selectedId);
  const selectedCategory = categories.find(
    (category) => category.id === selectedId
  );
  console.log(selectedCategory);
  setSelectedCategoryName(selectedCategory?.name || "");

  try {
    const subcategoriesRef = collection(
      db,
      "categories",
      selectedId,
      "subcategories"
    );
    const querySnapshot = await getDocs(subcategoriesRef);
    const subcategories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubcategories(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    setSubcategories([]); // Clear subcategories on error
  }
};

const [selectedItemCategoryId, setSelectedItemCategoryId] = useState("");
const [itemNames, setItemNames] = useState([]);

const handleSubcategoryChange = async (event) => {
  const selectedId = event.target.value;
  setSelectedItemCategoryId(selectedId);
  const selectedSubcategory = subcategories.find(
    (subcategory) => subcategory.id === selectedId
  );
  setSelectedSubcategoryName(selectedSubcategory?.name || "");

  try {
    const itemNamesRef = collection(
      db,
      "categories",
      selectedCategoryId,
      "subcategories",
      selectedId,
      "itemNames"
    );
    const querySnapshot = await getDocs(itemNamesRef);
    const itemNames = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItemNames(itemNames);
  } catch (error) {
    console.error("Error fetching item names:", error);
    setItemNames([]); // Clear item names on error
  }
};

const handleItemNameChange = (event) => {
  const itemName = event.target.value;
  setSelectedItemName(itemName); // Store item name
};


  const handleTabChange = (event, newTab) => {
    setCurrentTab(newTab);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredBookings = bookings.filter((booking) => {
    // Implement search logic based on relevant booking fields
    const searchTextLower = searchTerm.toLowerCase();
    return booking.patientName.toLowerCase().includes(searchTextLower);
    // ... other search criteria
  });

  const [open, setOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
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

const fetchReferralDoctors = async () => {
  try {
    const doctorsRef = collection(db, "thirdparty"); // Assuming the collection name is "thirdparty"

    const doctorsQuery = query(doctorsRef, where("role", "==", "thirdparty")); // Filter by role

    const querySnapshot = await getDocs(doctorsQuery);

    const doctors = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return []; // Return an empty array in case of errors
  }
};


const [referralDoctors, setReferralDoctors] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const doctors = await fetchReferralDoctors();
    setReferralDoctors(doctors);
  };

  fetchData();
}, []);

  // Function to handle dialog opening and closing
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

  // Function to add a new booking based on form data
  const handleAddBooking = async () => {
    try {
      // Validate required fields
      if (!newBookingData.patientName || !newBookingData.date) {
        throw new Error("Please fill in Patient Name and Date fields.");
      }
      

      // Add booking data to Firestore
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

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="Current Bookings" />
        <Tab label="Past Bookings" />
      </Tabs>
      <TextField
        label="Search Bookings"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleClickOpen} sx={{ my: 2 }}>
        Add New Booking
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer className={classes.tableContainer}>
          <Table aria-label="bookings table">
            <TableHead>
              <TableRow>
                {/* Table header cells for relevant booking data */}
                <TableCell>Patient Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>State</TableCell>
                {/* ... other table headers */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  onClick={() => {
                    // Handle click to navigate to BookingDetails component
                  }}
                >
                  {/* Table data cells for booking details */}
                  <TableCell>{booking.patientName}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.state}</TableCell>
                  {/* ... other table data */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for adding a new booking */}
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
                {referralDoctors.map((doctor) => (
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
            {/* ... additional fields for additionalInfo and typeOfSpecimen */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Additional Information:
              </Typography>
              {[
                "Family History",
                "Social History",
                "Medications",
                "Allergies",
              ].map((option) => (
                <FormControl
                  key={option}
                  labelId={`${option}-label`}
                  sx={{ mt: 1 }}
                >
                  <InputLabel id={`${option}-label`}>{option}</InputLabel>
                  <Select
                    labelId={`${option}-label`}
                    name={`additionalInfo[${option}]`}
                    value={newBookingData.additionalInfo[option] || ""} // Set initial value
                    onChange={(event) =>
                      setNewBookingData({
                        ...newBookingData,
                        additionalInfo: {
                          ...newBookingData.additionalInfo,
                          [option]: event.target.value,
                        },
                      })
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                    {/* ... other options as needed */}
                  </Select>
                </FormControl>
              ))}
            </Box>

            {/* Type of Specimen */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Type of Specimen:</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="subcategory-label">Subcategory</InputLabel>
                <Select
                  labelId="subcategory-label"
                  value={selectedItemCategoryId}
                  onChange={handleSubcategoryChange}
                  disabled={!selectedCategoryId} // Disable if no category selected
                >
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel id="item-name-label">Item Name</InputLabel>
  <Select
    labelId="item-name-label"
    value={newBookingData.typeOfSpecimen.item} // Assuming you store the selected item in state
    onChange={(event) =>
      setNewBookingData({
        ...newBookingData,
        typeOfSpecimen: {
          ...newBookingData.typeOfSpecimen,
          item: event.target.value,
        },
      })
    }
    disabled={!selectedItemCategoryId} // Disable if no subcategory selected
  >
    {itemNames.map((itemName) => (
      <MenuItem key={itemName.id} value={itemName.id}>
        {itemName.name}
      </MenuItem>
    ))}
  </Select>
</FormControl> */}

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="itemName-label">Item Name</InputLabel>
                <Select
                  labelId="itemName-label"
                  name="itemName"
                  value={selectedItemName}
                  onChange={handleItemNameChange}
                >
                  {itemNames.map((itemName) => (
                    <MenuItem key={itemName.id} value={itemName.name}>
                      {itemName.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBooking}>
            Add Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;