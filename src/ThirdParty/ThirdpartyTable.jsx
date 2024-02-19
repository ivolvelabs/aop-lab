import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  tableCellClasses,
  Paper,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { DeleteOutlineRounded } from "@mui/icons-material";
import styled from "@emotion/styled";

const ThirdpartyTable = ({ thirdParties }) => {
  const theme = useTheme();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedThirdPartyId, setSelectedThirdPartyId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTeamMembers, setEditTeamMembers] = useState([]);


  const handleEditThirdParty = (thirdParty) => {
    setSelectedThirdPartyId(thirdParty.id);
    setEditName(thirdParty.name);
    setEditType(thirdParty.type);
    setEditAddress(thirdParty.address);
    setEditEmail(thirdParty.email);
    setEditPhone(thirdParty.phone);
    setEditTeamMembers(thirdParty.teamMembers);
    setEditDialogOpen(true);
  };

  const handleDeleteThirdParty = (thirdPartyId) => {
    // Implement logic to delete third party with Firestore operation
    // Update the state after successful deletion
  };

  const handleSaveEditedThirdParty = async () => {
    // Implement logic to update third party data in Firestore
    // Update the state and close the dialog after successful update
  };


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: "white",
  },
}));

  return (
    <div>
      {/* ... search field */}
      <TableContainer
      className="table---"
        component={Paper}
        // style={{ backgroundColor: theme.palette.text.main }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow
              sx={{
                background: theme.palette.primary.main,
              }}
            >
              <StyledTableCell>Name</StyledTableCell>
              {/* <StyledTableCell>Type</StyledTableCell> */}
              <StyledTableCell>Address</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Phone</StyledTableCell>
              <StyledTableCell>Team Members</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderColor: theme.palette.primary.main, borderWidth: "2px", borderStyle: "solid" }}>
            {thirdParties.map((thirdParty) => (
              <TableRow key={thirdParty.id}>
                <TableCell>{thirdParty?.name}</TableCell>
                {/* <TableCell>{thirdParty?.type}</TableCell> */}
                <TableCell>{thirdParty?.address}</TableCell>
                <TableCell>{thirdParty?.email}</TableCell>
                <TableCell>{thirdParty?.phone}</TableCell>
                <TableCell>{thirdParty?.teamMembers?.join(", ")}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditThirdParty(thirdParty)}>
                    {/* Edit icon */}
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteThirdParty(thirdParty.id)}
                  >
                    <DeleteOutlineRounded />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ... Edit Third Party Dialog (similar to Add Third Party Dialog) */}
    </div>
  );
};

export default ThirdpartyTable;
