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
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { useAuth } from "../Contexts/AuthContext";

const filter = createFilterOptions();

const ThirdPartyReportsTest = () => {
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
  const [date, setDate] = useState(dayjs(new Date()));
  const [prn, setPrn] = useState("");
  const [crn, setCrn] = useState("");

const { role, user } = useAuth();



  const fetchPrn = async () => {
    const prnRef = doc(db, "metaData", "metaDataDetails");
    const prnData = await getDoc(prnRef);
    const prnumber = prnData.data().prevReportNumber;
    // console.log(`${prnumber}`);
    console.log(
      "-----------------------------------------------" +
        prnumber.substring(prnumber.lastIndexOf("/") + 1)
    );

    setPrn(prnumber.substring(prnumber.lastIndexOf("/") + 1));
    return prnumber;
  };

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
    setCrn("");
    setNewBookingData({
      patientName: "",
      age: "",
      sex: "",
      referralDoctor: [],
      phone: "",
      hospital: [],
      bookingDate: "",
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
        where("type", "==", "hospital"),
        where("email", "==", user.email)
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
    const year = new Date().getFullYear().toString().substring(2);
    setSelectedCategory(value);
    fetchSubcategories(value.id);
    console.log(prn);
    console.log(
      `AOP/${value.name.substring(0, 3).toUpperCase()}/${year}/${
        Number(prn) + 1
      }`
    );
    setCrn(
      `AOP/${value.name.substring(0, 1).toUpperCase()}/${year}/${
        Number(prn) + 1
      }`
    );
  };

  const handleSubcategoryChange = (value) => {
    setSelectedSubcategory(value);
    fetchItemNames(value.id);
    console.log(crn);
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
    fetchPrn();
    fetchHospitalsAndDoctors();
    fetchCategories();
  }, []);

  const handleAddBooking = async () => {
    const docRef = doc(collection(db, "bookings"));
    const metaDataRef = doc(db, "metaData", "metaDataDetails");
    try {
      setIsLoading(true);

      const statesInfo = [
        {
          state: "received",
          stateName: "Received",
          isDone: true,
          updatedAt: new Date(),
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
        bookingDate: dayjs(date).format("DD-MM-YYYY"),
        isCompleted: false,
        createdAt: serverTimestamp(),
        statesInfo,
        serialNumber: crn,
        id: docRef.id,
        typeOfSpecimen: {
          category: selectedCategory.name,
          subcategory: selectedSubcategory.name,
          itemName: selectedItem,
        },
      };

      await updateDoc(metaDataRef, {
        prevReportNumber: crn,
      });

      await setDoc(docRef, bookingData);

      setBookings((prevBookings) => [bookingData, ...prevBookings]);

      // Handle success
      await setIsLoading(false);
      await handleClose();
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
          where("hospital.email", "==", user.email),
          where("isCompleted", "==", true)
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
        <BookingsTable bookings={filteredBookings} role={role} />
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
              variant="filled"
              sx={{ mt: 2 }}
              label="Patient Name"
              name="patientName"
              value={newBookingData.patientName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              variant="filled"
              sx={{ mt: 2 }}
              label="Patient Age"
              name="age"
              value={newBookingData.age}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <RadioGroup
              row
              name="uncontrolled-radio-buttons-group"
              value={newBookingData.sex}
              onChange={handleChange}
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>

            <TextField
              variant="filled"
              sx={{ mt: 2 }}
              label="Phone Number"
              name="phone"
              value={newBookingData.phone}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Controlled picker"
                value={date}
                format="DD-MM-YYYY"
                onChange={(newValue) => setDate(newValue)}
              />
            </LocalizationProvider>
            <Autocomplete
              value={hospital}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setHospital({
                    name: newValue,
                  });
                } else if (newValue && newValue.inputValue) {
                  // Create a new value from the user input
                  setHospital({
                    name: newValue.inputValue,
                  });
                } else {
                  setHospital(newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(
                  (option) => inputValue === option.name
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push({
                    inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="hospital-id"
              options={hospitals}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === "string") {
                  return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue;
                }
                // Regular option
                return option.name;
              }}
              renderOption={(props, option) => (
                <li {...props}>{option.name}</li>
              )}
              freeSolo
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField {...params} label="Select or Enter Hospital Name" />
              )}
            />

            <Autocomplete
              value={doctor}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setDoctor({
                    name: newValue,
                  });
                } else if (newValue && newValue.inputValue) {
                  // Create a new value from the user input
                  setDoctor({
                    name: newValue.inputValue,
                  });
                } else {
                  setDoctor(newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(
                  (option) => inputValue === option.name
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push({
                    inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="doctor-id"
              options={doctors}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === "string") {
                  return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue;
                }
                // Regular option
                return option.name;
              }}
              renderOption={(props, option) => (
                <li {...props}>{option.name}</li>
              )}
              freeSolo
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or Enter Referring Doctor Name"
                />
              )}
            />

            <TextField
              // variant="filled"
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
              // variant="filled"
              sx={{ mt: 2 }}
              label="Relevant Clinical History"
              name="clinicalHistory"
              value={newBookingData.clinicalHistory}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <FormControl variant="filled" sx={{ mt: 2 }} fullWidth>
              <InputLabel id="catgory-label">
                Pathology Test Category
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                labelId="category-label"
                name="category"
                id="category"
                label="Select Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" sx={{ mt: 2 }} fullWidth>
              <InputLabel id="subcategory-label">Specimen Type</InputLabel>
              <Select
                // sx={{ mt: 2 }}
                value={selectedSubcategory}
                disabled={!selectedCategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                labelId="subcategory-label"
                name="subcategory"
                id="subcategory"
                label="Select Specimen Type"
              >
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" sx={{ mt: 2 }} fullWidth>
              <InputLabel id="itemName-label">Name of Specimen</InputLabel>
              <Select
                value={selectedItem}
                disabled={!selectedSubcategory}
                onChange={(e) => handleItemNameChange(e.target.value)}
                labelId="itemName-label"
                name="itemName"
                id="name-of-specimen"
                label="Select Name of Specimen"
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

export default ThirdPartyReportsTest;
