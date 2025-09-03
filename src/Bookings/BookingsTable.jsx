import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  tableCellClasses,
  CircularProgress,
  TableBody,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";
import dayjs from "dayjs";
import ResultAuthorised from "./ResultAuthorised";
import MyBookings from "./MyBookings";
import Chip from "@mui/material/Chip";

const BookingsTable = ({ bookings, role }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      color: "white",
    },
  }));
  // const StyledTableRow = styled(TableRow)(({ theme }) => ({
  //   [`&.${tableCellClasses.head}`]: {
  //     color: "white",
  //   },
  // }));

  return (
    <div>
      {bookings.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow
                sx={{
                  background: theme.palette.primary.main,
                }}
              >
                {/* Define table headers based on your schema */}
                <StyledTableCell>S. No</StyledTableCell>
                <StyledTableCell>Booking Date</StyledTableCell>
                <StyledTableCell>Patient Name</StyledTableCell>
                <StyledTableCell>Age</StyledTableCell>
                <StyledTableCell>Sex</StyledTableCell>
                <StyledTableCell>Referring Doctor</StyledTableCell>
                <StyledTableCell>Phone</StyledTableCell>
                <StyledTableCell>Hospital</StyledTableCell>
                <StyledTableCell>Clinical Diagnosis</StyledTableCell>
                {/* <StyledTableCell>Clinical History</StyledTableCell> */}
                <StyledTableCell>Booked Test</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  sx={{
                    // fontSize: "5px",
                    cursor: "pointer",
                    // "&.MuiTableRow-hover": {
                    //   background: theme.palette.secondary.main,
                    // },
                    "&.MuiTableRow-root:hover": {
                      background: theme.palette.text.main,
                    },
                  }}
                  hover
                  onClick={() =>
                    role !== "thirdparty"
                      ? navigate(`/bookings/${booking.id}`)
                      : navigate(`/myBookings/${booking.id}`, {
                          state: booking,
                        })
                  }
                >
                  <TableCell style={{ fontSize: "10px", fontWeight: "900" }}>
                    {booking?.serialNumber}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {console.log(booking.bookingDate.toDate())}
                    {booking.bookingDate.toDate().toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.patientName}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.age}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.sex}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.referralDoctor.name}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.phone}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.hospital?.name}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.clinicalDiagnosis}
                  </TableCell>
                  {/* <TableCell style={{ fontSize: "10px" }}>{booking.clinicalHistory}</TableCell> */}
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.typeOfSpecimen
                      ? `${booking.typeOfSpecimen.category} - ${booking.typeOfSpecimen.subcategory} - ${booking.typeOfSpecimen.itemName}`
                      : "-"}
                  </TableCell>
                  <TableCell style={{ fontSize: "10px" }}>
                    {booking.isCompleted ? (
                      <Chip label="Completed" color="success" />
                    ) : (
                      <Chip label="Pending" color="warning" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No bookings found.</p>
      )}
      {bookings.length === 0 && <CircularProgress sx={{ mt: 2 }} />}
    </div>
  );
};

export default BookingsTable;
