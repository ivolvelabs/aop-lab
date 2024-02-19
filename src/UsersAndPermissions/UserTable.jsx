import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  tableCellClasses,
  Button,
  TextField,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { getAuth, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { Close, Delete, Replay } from "@mui/icons-material";
import styled from "@emotion/styled";

const UserTable = ({ users }) => {
  const theme = useTheme();

const [openSnackbar, setOpenSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");

const handleResetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(getAuth(), email);
    setOpenSnackbar(true);
    setSnackbarMessage("Password reset email sent successfully!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    setOpenSnackbar(true);
    setSnackbarMessage("Error sending password reset email!");
  }
};



  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      color: "white",
    },
  }));

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              background: theme.palette.primary.main,
            }}
          >
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell>Reset Email</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              borderColor: theme.palette.primary.main,
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role ? user.role : null}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleResetPassword(user.email)}
                    variant="outlined"
                    startIcon={<Replay />}
                  >
                    Reset Password
                  </Button>
                  {/* <IconButton onClick={() => handleResetPassword(user.email)}>
                    <Replay color="error" />
                  </IconButton> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpenSnackbar(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default UserTable;
