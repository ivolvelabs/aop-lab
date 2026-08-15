import React from "react";
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  tableCellClasses,
  TableBody,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import Chip from "@mui/material/Chip";
import { formatDisplayDate } from "../utils/dateFormat";

const hasPendingThirdPartyLogin = (party) =>
  party?.credentialsStatus === "pending" ||
  (!party?.authUid && party?.createdFrom === "booking");

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
        <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: "calc(100vh - 260px)" }}>
          <Table stickyHeader sx={{ minWidth: 1040 }} aria-label="bookings table">
            <TableHead>
              <TableRow
                sx={{
                  "& th": { background: theme.palette.primary.dark },
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
                  key={booking.id}
                  sx={{
                    cursor: "pointer",
                    "&.MuiTableRow-root:hover": {
                      background: "rgba(0, 87, 184, 0.06)",
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
                  <TableCell sx={{ fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
                    {booking?.serialNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDisplayDate(booking.bookingDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 800, minWidth: 150 }}>
                    {booking.patientName}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {booking.age}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, textTransform: "capitalize" }}>
                    {booking.sex}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, minWidth: 150 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: 12 }}>
                        {booking.referralDoctor?.name}
                      </Typography>
                      {hasPendingThirdPartyLogin(booking.referralDoctor) ? (
                        <Chip
                          label="Login pending"
                          color="warning"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 0.5, height: 20, fontSize: 10, fontWeight: 800 }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {booking.phone}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, minWidth: 140 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: 12 }}>
                        {booking.hospital?.name}
                      </Typography>
                      {hasPendingThirdPartyLogin(booking.hospital) ? (
                        <Chip
                          label="Login pending"
                          color="warning"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 0.5, height: 20, fontSize: 10, fontWeight: 800 }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, minWidth: 180 }}>
                    {booking.clinicalDiagnosis}
                  </TableCell>
                  {/* <TableCell style={{ fontSize: "10px" }}>{booking.clinicalHistory}</TableCell> */}
                  <TableCell sx={{ fontSize: 12, minWidth: 220 }}>
                    {booking.typeOfSpecimen
                      ? `${booking.typeOfSpecimen.category} - ${booking.typeOfSpecimen.subcategory} - ${booking.typeOfSpecimen.itemName}`
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {booking.isCompleted ? (
                      <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 800 }} />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 800 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ maxWidth: 420, mx: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 850 }}>
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Change the search query or create a new booking to start a workflow.
            </Typography>
          </Box>
        </Paper>
      )}
    </div>
  );
};

export default BookingsTable;
