import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  ListItem,
} from "@mui/material";
// import Button from "@mui/material/Button";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {  getAuth, signOut } from "firebase/auth";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import './MainLayout.css';
import { useAuth } from "../Contexts/AuthContext"; // Import your AuthContext
import { auth } from "../firebase";
import { Logout } from "@mui/icons-material";

function MainLayout({ children }) {
const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

const handleListItemClick = (index) => {
  setSelectedIndex(index);
};


const logout = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      setIsLoggedIn(false);
      setAuthUser(null);
    //   setLoading(true);
    setRole(null);
    })
    .catch((error) => {
      // An error happened.
    });
};

  const isAdmin = isLoggedIn && role === "admin";
  const isThirdParty = isLoggedIn && role === "thirdparty";

  return (
    <div style={{ display: "flex" }}>
      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        {/* <List>
          <ListItemButton
            onClick={(event) => (handleListItemClick(event, 0), navigate('/'))}
            selected={selectedIndex === 0}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton
            // href="/bookings"
            onClick={(event) => (handleListItemClick(event, 1), navigate('/bookings'))}
            selected={selectedIndex === 1}
          >
            <ListItemIcon>
              <CalendarTodayIcon />
            </ListItemIcon>
            <ListItemText primary="Bookings" />
          </ListItemButton>
          {isAdmin && (
            <ListItemButton
              onClick={(event) => (handleListItemClick(event, 2))}
              selected={selectedIndex === 2}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users and Permissions" />
            </ListItemButton>
          )}
          {!isThirdParty && (
            <ListItemButton
              onClick={(event) => handleListItemClick(event, 3)}
              selected={selectedIndex === 3}
            >
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Third Party" />
            </ListItemButton>
          )}
          <ListItemButton
            onClick={(event) => (handleListItemClick(event, 4), navigate('/masters'))}
            selected={selectedIndex === 4}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Masters" />
          </ListItemButton>
          <Button
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            Logout
          </Button>
        </List> */}
        <List className="navigation">
          <ListItem><NavLink to='/'>Home</NavLink></ListItem>
          <ListItem><NavLink to='bookings'>Bookings</NavLink></ListItem>
          <ListItem><NavLink to='usersandpermissions'>Users and Permissions</NavLink></ListItem>
          <ListItem><NavLink to='masters'>Masters</NavLink></ListItem>
          <ListItem><NavLink to='thirdparty'>Third Party</NavLink></ListItem>
        {/* <NavLink>Home</NavLink>
        <NavLink>Bookings</NavLink>
        <NavLink>Users and Permissions</NavLink>
        <NavLink>Masters</NavLink>
        <NavLink>Third Party</NavLink> */}
        </List>
      </Drawer>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: "20px" }}><Outlet /></main>
    </div>
  );
}

export default MainLayout;
