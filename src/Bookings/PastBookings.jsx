import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";

const CurrentBookings = () => {
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
          {/* <div
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
            > */}
              {/* {loading ? <CircularProgress size={24} /> : "Add New Booking"} */}
              {/* Add New Booking
            </Button>
          </div> */}
        </div>
      </div>
      {isLoading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : bookings.length > 0 ? (
        <BookingsTable bookings={filteredBookings} isCurrent={true} />
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default CurrentBookings;
