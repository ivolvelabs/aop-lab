import React, { useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  tableCellClasses,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  ArchiveOutlined,
  Close,
  EditOutlined,
  Replay,
  RestoreOutlined,
} from "@mui/icons-material";
import styled from "@emotion/styled";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: "white",
    fontWeight: 800,
  },
}));

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const UserTable = ({ users, currentUid, onEdit, onArchive, onRestore }) => {
  const theme = useTheme();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(getAuth(), email);
      setOpenSnackbar(true);
      setSnackbarMessage("Password reset email sent.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setOpenSnackbar(true);
      setSnackbarMessage("Password reset email could not be sent.");
    }
  };

  return (
    <div>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table sx={{ minWidth: 760 }} aria-label="users table">
          <TableHead sx={{ background: theme.palette.primary.main }}>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const active = isActiveRecord(user);
              const isSelf = currentUid === (user.authUid || user.id);

              return (
                <TableRow key={user.id} hover sx={{ opacity: active ? 1 : 0.68 }}>
                  <TableCell>{user.fullName || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.role || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={active ? "Active" : "Inactive"}
                      color={active ? "success" : "default"}
                      variant={active ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Button
                        color="primary"
                        onClick={() => handleResetPassword(user.email)}
                        variant="outlined"
                        size="small"
                        startIcon={<Replay />}
                      >
                        Reset
                      </Button>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit?.(user)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {active ? (
                        <Tooltip title={isSelf ? "You cannot deactivate your own account" : "Deactivate"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={isSelf}
                              onClick={() => onArchive?.(user)}
                            >
                              <ArchiveOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Restore">
                          <IconButton size="small" onClick={() => onRestore?.(user)}>
                            <RestoreOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3200}
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
