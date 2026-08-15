import React, { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import BookingsTable from "./BookingsTable";
import { Search } from "@mui/icons-material";
import { useAuth } from "../Contexts/AuthContext";

const matchesSearch = (booking, searchQuery) => {
  const term = searchQuery.toLowerCase().trim();
  if (!term) return true;

  return [
    booking.patientName,
    booking.serialNumber,
    booking.phone,
    booking.referralDoctor?.name,
    booking.hospital?.name,
    booking.typeOfSpecimen?.category,
    booking.typeOfSpecimen?.subcategory,
    booking.typeOfSpecimen?.itemName,
  ]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(term));
};

const ThirdPartyReports = () => {
const { role, user } = useAuth();


  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetching
        const thirdPartyField =
          user?.type === "doctor" ? "referralDoctor" : "hospital";
        const lookupValues = [
          ["id", user?.id],
          ["authUid", user?.authUid],
          ["email", user?.email],
        ].filter(([, value]) => value);

        const snapshots = await Promise.all(
          lookupValues.map(([field, value]) =>
            getDocs(
              query(
                collection(db, "bookings"),
                where(`${thirdPartyField}.${field}`, "==", value),
                where("isCompleted", "==", true)
              )
            )
          )
        );

        const fetchedBookings = new Map();
        snapshots.forEach((snapshot) => {
          snapshot.docs.forEach((bookingDoc) => {
            fetchedBookings.set(bookingDoc.id, {
              ...bookingDoc.data(),
              id: bookingDoc.id,
            });
          });
        });

        setBookings(Array.from(fetchedBookings.values()));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    if (user?.id || user?.authUid || user?.email) {
      fetchBookings();
    }
  }, [user?.authUid, user?.email, user?.id, user?.type]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredBookings = searchQuery
    ? bookings.filter((booking) => matchesSearch(booking, searchQuery))
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
            />
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
    </div>
  );
};

export default ThirdPartyReports;
