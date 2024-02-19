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

const BookingsTable = ({ bookings, isCurrent }) => {
    const theme = useTheme();

  // Implement logic to filter and display bookings based on isCurrent

  // Example assuming simple filtering:
  // const filteredBookings = isCurrent
  //   ? bookings.filter((booking) => !booking.isCompleted)
  //   : bookings.filter((booking) => booking.isCompleted);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: "white",
  },
}));

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
                <StyledTableCell>Patient Name</StyledTableCell>
                <StyledTableCell>Age</StyledTableCell>
                <StyledTableCell>Sex</StyledTableCell>
                <StyledTableCell>Referral Doctor</StyledTableCell>
                <StyledTableCell>Phone</StyledTableCell>
                <StyledTableCell>Hospital</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Clinical Diagnosis</StyledTableCell>
                <StyledTableCell>Clinical History</StyledTableCell>
                <StyledTableCell>Specimen Type</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  {/* Extract and display data from each booking object */}
                  <TableCell>{booking.patientName}</TableCell>
                  <TableCell>{booking.age}</TableCell>
                  <TableCell>{booking.sex}</TableCell>
                  <TableCell>{booking.referralDoctor}</TableCell>
                  <TableCell>{booking.phone}</TableCell>
                  <TableCell>{booking.hospital}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.clinicalDiagnosis}</TableCell>
                  <TableCell>{booking.clinicalHistory}</TableCell>
                  <TableCell>
                    {booking.typeOfSpecimen
                      ? `${booking.typeOfSpecimen.category} - ${booking.typeOfSpecimen.subcategory} - ${booking.typeOfSpecimen.itemName}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {booking.isCompleted ? "Completed" : "Pending"}
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
