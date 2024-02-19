import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { getAuth, deleteUser } from "firebase/auth";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { Delete } from "@mui/icons-material";

const UserTable = ({ users }) => {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users); // Assuming users is the initial data

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filterUsers = () => {
    const filteredData = users.filter((user) => {
      const fullName = user.fullName.toLowerCase();
      const email = user.email.toLowerCase();
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
    setFilteredUsers(filteredData);
  };

  useEffect(() => {
    filterUsers(); // Filter initially and on searchTerm changes
  }, [searchTerm, users]);

  return (
    <div>
      <TextField
        value={searchTerm}
        onChange={handleSearch}
        label="Search"
        type="search"
        fullWidth
        sx={{ mb: 2 }}
      />
      <TableContainer
        component={Paper}
        style={{ backgroundColor: theme.palette.text.main }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role ? user.role : null}</TableCell>
                <TableCell>
                  {/* <Button
                  onClick={() => deleteUserFromFirebase(user.id)}
                  variant="outlined"
                  startIcon={<Delete />}
                >
                  Delete
                </Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserTable;
