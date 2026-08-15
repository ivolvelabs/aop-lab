import React, { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";

const PastBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetching
        const q = query(
          collection(db, "bookings"),
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
        <Stack spacing={0.75}>
          <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
            Completed Reports
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
    </div>
  );
};

export default PastBookings;
