import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
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
  Alert,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Divider,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { useAuth } from "../Contexts/AuthContext";
import { buildWorkflowEvent } from "../utils/workflowAudit";

const filter = createFilterOptions();

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalizeName = (value) => String(value || "").trim();

const initialBookingData = {
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
};

const CurrentBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [doctorInputValue, setDoctorInputValue] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [hospitalInputValue, setHospitalInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [open, setOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState(initialBookingData);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemNames, setItemNames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [date, setDate] = useState(dayjs(new Date()));
  const [formError, setFormError] = useState("");
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  // const [prn, setPrn] = useState("");
  // const [crn, setCrn] = useState("");

  const getInlineThirdPartyName = (value) => {
    if (typeof value === "string") return normalizeName(value);
    return normalizeName(value?.inputValue || value?.name);
  };

  const handleThirdPartyChange = (setter, inputSetter) => (event, newValue) => {
    const name = getInlineThirdPartyName(newValue);

    if (typeof newValue === "string" || newValue?.inputValue) {
      setter(name ? { name, isNew: true } : null);
      inputSetter(name);
      return;
    }

    setter(newValue || null);
    inputSetter(newValue?.name || "");
  };

  const filterThirdPartyOptions = (options, params) => {
    const filtered = filter(options, params);
    const inputValue = normalizeName(params.inputValue);

    const isExisting = options.some(
      (option) => normalizeName(option.name).toLowerCase() === inputValue.toLowerCase()
    );

    if (inputValue && !isExisting) {
      filtered.push({
        inputValue,
        name: `Add "${inputValue}"`,
        isNew: true,
      });
    }

    return filtered;
  };

  const getThirdPartyOptionLabel = (option) => {
    if (typeof option === "string") return option;
    if (option?.inputValue) return option.inputValue;
    return option?.name || "";
  };

  const ensureThirdPartyRecord = async (record, type, fallbackName = "") => {
    if (record?.id) return record;

    const name = getInlineThirdPartyName(record) || normalizeName(fallbackName);
    if (!name) return null;

    const existingRecords = type === "doctor" ? doctors : hospitals;
    const existing = existingRecords.find(
      (item) => normalizeName(item.name).toLowerCase() === name.toLowerCase()
    );

    if (existing) return existing;

    const thirdPartyRef = doc(collection(db, "thirdparty"));
    const thirdPartyRecord = {
      id: thirdPartyRef.id,
      name,
      type,
      role: "thirdparty",
      active: true,
      loginAccess: false,
      credentialsStatus: "pending",
      createdFrom: "booking",
      wasCreatedDuringBooking: true,
      phone: "",
      address: "",
      ...(type === "hospital" ? { teamMembers: [] } : {}),
    };

    await setDoc(thirdPartyRef, {
      ...thirdPartyRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (type === "doctor") {
      setDoctors((prev) => [thirdPartyRecord, ...prev]);
    } else {
      setHospitals((prev) => [thirdPartyRecord, ...prev]);
    }

    return thirdPartyRecord;
  };

  const buildBookingThirdPartySnapshot = (record) => {
    const hasLogin = Boolean(record?.authUid);
    const loginAccess = hasLogin && record?.loginAccess !== false;

    return {
      id: record?.id || "",
      name: record?.name || "",
      type: record?.type || "",
      email: record?.email || "",
      phone: record?.phone || "",
      address: record?.address || "",
      authUid: record?.authUid || "",
      loginAccess,
      credentialsStatus: hasLogin
        ? record?.credentialsStatus || (loginAccess ? "enabled" : "disabled")
        : record?.credentialsStatus || "pending",
      createdFrom: record?.createdFrom || "",
      wasCreatedDuringBooking: record?.wasCreatedDuringBooking === true,
    };
  };
  
  
  // const fetchPrn = async () => {
  //   const prnRef = doc(db, "metaData", "metaDataDetails");
  //   const prnData = await getDoc(prnRef);
  //   const prnumber = prnData.data().prevReportNumber;
  //   // setPrn(prnumber.substring(prnumber.lastIndexOf("/") + 1));
  //   return prnumber;
  // }
  

  

  const handleClickOpen = () => {
    setFormError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDoctor(null);
    setDoctorInputValue("");
    setHospital(null);
    setHospitalInputValue("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedItem("");
    setNewBookingData(initialBookingData);
    setDate(dayjs(new Date()));
    setFormError("");
  };

  // Function to handle form changes
  const handleInputChange = (event) => {
    setNewBookingData({
      ...newBookingData,
      [event.target.name]: event.target.value,
    });
  };

const handleReportNumber = async (value) => {
  // value = { id, name, years: [{ rnSeries, crNumber, year }] }
  const currentYear = new Date().getFullYear().toString().slice(-2); // "25"
  const docRef = doc(db, "categories", value.id);

  try {
    const reportNumber = await runTransaction(db, async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists()) throw new Error("Category not found");

      const data = snap.data() || {};
      const years = Array.isArray(data.years) ? data.years : [];

      // Find current year entry (e.g., "25")
      const idx = years.findIndex((y) => String(y.year) === currentYear);

      if (idx >= 0) {
        // Increment existing year counter
        const entry = years[idx];
        const nextCr = Number(entry.crNumber || 0) + 1;
        const rnSeries = entry.rnSeries; // keep existing series
        const updated = [...years];
        updated[idx] = { ...entry, crNumber: nextCr };

        tx.update(docRef, { years: updated });

        return `${rnSeries}/${nextCr}`;
      } else {
        // Create new year entry
        const prefixLetter =
          (value.name || "").trim().charAt(0).toUpperCase() || "X"; // fallback
        const rnSeries = `AOP/${prefixLetter}/${currentYear}`;
        const nextCr = 1;
        const updated = [
          ...years,
          { year: currentYear, rnSeries, crNumber: nextCr },
        ];

        tx.update(docRef, { years: updated });

        return `${rnSeries}/${nextCr}`;
      }
    });

    return reportNumber;
  } catch (err) {
    console.error("Failed to compute report number:", err);
  }
};



// const handleReportNumber = async(value) => {
//   console.log(value);
//   const year = new Date().getFullYear().toString().substring(2);
//   console.log(year);
//   console.log(year === value.years.year);
//   if (year === value.years.year) {
//     setReportNumber(
//       `${value.years.rnSeries}/${value.years.year}/${Number(value.years.crNumber) + 1}`
//     );
//     console.log(
//       `${value.years.rnSeries}/${value.years.year}/${
//         Number(value.years.crNumber) + 1
//       }`
//     );
//   } else {
//     const catRef = doc(db, "categories", where("name", "==", value.name));
//     await updateDoc(catRef, {
//       years: [
//         {
//           year: year,
//           rnSeries: `AOP/${value.name.substring(0, 1).toUpperCase()}/${year}`,
//           crNumber: 0,
//         },
//       ],
//     });
//     setReportNumber(`${value.crnSeries}/${year}/${Number(value.crNumber) + 1}`);
//   }
// }
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

      const hospitals = hospitalsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(isActiveRecord);
      const doctors = doctorsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(isActiveRecord);

      // Set the fetched data to state or use it as needed
      setHospitals(hospitals);
      setDoctors(doctors);
    } catch (error) {
      console.error("Error fetching hospitals and doctors:", error);
    }
  };

  const handleCategoryChange = async (value) => {
    // const year = new Date().getFullYear().toString().substring(2);
    setSelectedCategory(value);
    setSelectedSubcategory("");
    setSelectedItem("");
    fetchSubcategories(value.id);
    // handleReportNumber(value);
    // console.log(`AOP/${value.name.substring(0, 3).toUpperCase()}/${year}/${Number(value.crn) + 1}`);
    // setCrn(
    //   `AOP/${value.name.substring(0, 1).toUpperCase()}/${year}/${
    //     Number(prn) + 1
    //   }`
    // );
  };

  const handleSubcategoryChange = (value) => {
    setSelectedSubcategory(value);
    setSelectedItem("");
    fetchItemNames(value.id);
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesQuery);
      setCategories(
        categoriesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(isActiveRecord)
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
        const subcategories = subcategoriesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(isActiveRecord);
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
        const itemNames = itemNamesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(isActiveRecord);
        setItemNames(itemNames);
      } catch (error) {
        console.error("Error fetching item names:", error);
      }
    }
  };

  // Call the fetch functions in your component's effect or when needed
  useEffect(() => {
    // fetchPrn();
    fetchHospitalsAndDoctors();
    fetchCategories();
  }, []);

  const handleAddBooking = async () => {
    const docRef = doc(collection(db, "bookings"));
    try {
      setIsSavingBooking(true);
      setFormError("");

      const doctorCandidate = doctor || (
        normalizeName(doctorInputValue) ? { name: doctorInputValue, isNew: true } : null
      );
      const hospitalCandidate = hospital || (
        normalizeName(hospitalInputValue) ? { name: hospitalInputValue, isNew: true } : null
      );

      if (
        !getInlineThirdPartyName(doctorCandidate) ||
        !getInlineThirdPartyName(hospitalCandidate)
      ) {
        setFormError("Select or enter doctor and hospital/clinic before saving.");
        return;
      }

      if (!selectedCategory?.id || !selectedSubcategory?.id || !selectedItem?.name) {
        setFormError("Select category, specimen type, and specimen name before saving.");
        return;
      }

      if (
        !newBookingData.patientName.trim() ||
        !newBookingData.age ||
        !newBookingData.sex ||
        !newBookingData.phone.trim()
      ) {
        setFormError("Patient name, age, sex, and phone are required.");
        return;
      }

      if (!date?.isValid?.()) {
        setFormError("Select a valid booking date.");
        return;
      }

      const resolvedDoctor = await ensureThirdPartyRecord(
        doctorCandidate,
        "doctor",
        doctorInputValue
      );
      const resolvedHospital = await ensureThirdPartyRecord(
        hospitalCandidate,
        "hospital",
        hospitalInputValue
      );

      if (!resolvedDoctor?.id || !resolvedHospital?.id) {
        setFormError("Doctor and hospital/clinic could not be prepared. Please try again.");
        return;
      }

      const normalizedSelectedItemName = selectedItem.name.trim();
      const itemExists = itemNames.some(
        (item) =>
          item.name?.trim().toLowerCase() ===
          normalizedSelectedItemName.toLowerCase()
      );

      if (!itemExists) {
        const itemRef = collection(
          db,
          "categories",
          selectedCategory.id,
          "subcategories",
          selectedSubcategory.id,
          "itemNames"
        );
        await addDoc(itemRef, {
          name: normalizedSelectedItemName,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const serial = await handleReportNumber(selectedCategory);

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
        referralDoctor: buildBookingThirdPartySnapshot(resolvedDoctor),
        hospital: buildBookingThirdPartySnapshot(resolvedHospital),
        thirdPartySetup: {
          doctorCreatedDuringBooking:
            resolvedDoctor?.wasCreatedDuringBooking === true,
          hospitalCreatedDuringBooking:
            resolvedHospital?.wasCreatedDuringBooking === true,
          hasPendingCredentials:
            !resolvedDoctor?.authUid || !resolvedHospital?.authUid,
        },
        bookingDate: date?.toDate ? date.toDate() : new Date(),
        isCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statesInfo,
        serialNumber: serial,
        id: docRef.id,
        workflowHistory: [
          buildWorkflowEvent({
            step: "received",
            action: "Booking created",
            user,
          }),
        ],
        typeOfSpecimen: {
          category: selectedCategory.name,
          subcategory: selectedSubcategory.name,
          itemName: normalizedSelectedItemName,
        },
      };

      await setDoc(docRef, bookingData);

      setBookings((prevBookings) => [bookingData, ...prevBookings]);
      setSaveNoticeOpen(true);
      handleClose();
    } catch (error) {
      // Handle errors gracefully
      console.error("Error adding booking:", error);
      setFormError("Booking could not be saved. Please check the details and try again.");
    } finally {
      setIsSavingBooking(false);
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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredBookings = normalizedSearch
    ? bookings.filter((booking) =>
        [
          booking.patientName,
          booking.serialNumber,
          booking.phone,
          booking.referralDoctor?.name,
          booking.hospital?.name,
          booking.clinicalDiagnosis,
          booking.typeOfSpecimen?.category,
          booking.typeOfSpecimen?.subcategory,
          booking.typeOfSpecimen?.itemName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      )
    : bookings;

  return (
    <div>
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 0.5 }}>
              Active Cases
            </Typography>
            <TextField
              value={searchQuery}
              onChange={handleSearch}
              label="Search by patient, report no, doctor, hospital, phone, or test"
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
          </Box>
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", md: "flex-end" } }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              onClick={() => handleClickOpen()}
              sx={{ minHeight: 40, width: { xs: "100%", md: "auto" } }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Add Booking"}
            </Button>
          </Box>
        </Stack>
      </Paper>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredBookings.length > 0 ? (
        <BookingsTable bookings={filteredBookings} isCurrent={true} />
      ) : (
        <BookingsTable bookings={[]} isCurrent={true} />
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Booking</DialogTitle>
        <DialogContent sx={{ bgcolor: "rgba(248, 250, 252, 0.72)" }}>
          <DialogContentText>
            Create the case, assign or add third-party records, and choose the booked test.
          </DialogContentText>
          {formError ? <Alert severity="warning" sx={{ mt: 2 }}>{formError}</Alert> : null}
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ gridColumn: { md: "span 2" }, fontWeight: 900 }}>
              Patient
            </Typography>
            <TextField
              variant="filled"
              label="Patient Name"
              name="patientName"
              value={newBookingData.patientName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              variant="filled"
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
              sx={{ alignItems: "center" }}
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
              label="Phone Number"
              name="phone"
              value={newBookingData.phone}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Booking Date"
                value={date}
                format="DD-MM-YYYY"
                onChange={(newValue) => setDate(newValue)}
              />
            </LocalizationProvider>
            <Divider sx={{ gridColumn: { md: "span 2" } }} />
            <Typography variant="subtitle2" sx={{ gridColumn: { md: "span 2" }, fontWeight: 900 }}>
              Referral
            </Typography>
            <Autocomplete
              value={hospital}
              inputValue={hospitalInputValue}
              onInputChange={(event, newInputValue) => {
                setHospitalInputValue(newInputValue);
              }}
              onChange={handleThirdPartyChange(setHospital, setHospitalInputValue)}
              filterOptions={filterThirdPartyOptions}
              selectOnFocus
              autoSelect
              clearOnBlur
              handleHomeEndKeys
              id="hospital-id"
              options={hospitals}
              getOptionLabel={getThirdPartyOptionLabel}
              renderOption={(props, option) => (
                <li {...props}>{option.name}</li>
              )}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Select or Enter Hospital/Clinic"
                  helperText="New entries are saved to Third Party with login credentials pending."
                />
              )}
            />

            <Autocomplete
              value={doctor}
              inputValue={doctorInputValue}
              onInputChange={(event, newInputValue) => {
                setDoctorInputValue(newInputValue);
              }}
              onChange={handleThirdPartyChange(setDoctor, setDoctorInputValue)}
              filterOptions={filterThirdPartyOptions}
              selectOnFocus
              autoSelect
              clearOnBlur
              handleHomeEndKeys
              id="doctor-id"
              options={doctors}
              getOptionLabel={getThirdPartyOptionLabel}
              renderOption={(props, option) => (
                <li {...props}>{option.name}</li>
              )}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Select or Enter Referring Doctor"
                  helperText="New entries are saved to Third Party with login credentials pending."
                />
              )}
            />

            <TextField
              // variant="filled"
              sx={{ gridColumn: { md: "span 2" } }}
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
              sx={{ gridColumn: { md: "span 2" } }}
              label="Relevant Clinical History"
              name="clinicalHistory"
              value={newBookingData.clinicalHistory}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
            />
            <Divider sx={{ gridColumn: { md: "span 2" } }} />
            <Typography variant="subtitle2" sx={{ gridColumn: { md: "span 2" }, fontWeight: 900 }}>
              Booked Test
            </Typography>
            <FormControl variant="filled" fullWidth>
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
            <FormControl variant="filled" fullWidth>
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
            {/* <FormControl variant="filled" sx={{ mt: 2 }} fullWidth>
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
            </FormControl> */}

            <Autocomplete
              value={selectedItem}
              onChange={(event, newValue) => {
                // if (typeof newValue === "string") {
                //   setSelectedItem({
                //     newValue,
                //   });
                // } else if (newValue && newValue.inputValue) {
                // } else
                if (newValue && newValue.inputValue) {
                  // Create a new value from the user input
                  setSelectedItem({
                    name: newValue.inputValue,
                  });
                } else {
                  setSelectedItem(newValue);
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
              id="name-of-specimen"
              options={itemNames}
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
              sx={{ gridColumn: { md: "span 2" } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or Enter Name of Specimen"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" disabled={isSavingBooking} onClick={handleAddBooking}>
            {isSavingBooking ? <CircularProgress size={24} color="inherit" /> : "Add New Booking"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={saveNoticeOpen}
        autoHideDuration={2600}
        onClose={() => setSaveNoticeOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSaveNoticeOpen(false)} severity="success" sx={{ width: "100%" }}>
          Booking created and workflow started.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CurrentBookings;
