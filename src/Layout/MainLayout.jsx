import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  ListItem,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import "./MainLayout.css";
import { useAuth } from "../Contexts/AuthContext"; // Import your AuthContext
import { auth } from "../firebase";
import { Feed, Home, LocalHospital, Logout, LogoutOutlined, PeopleAlt, Widgets } from "@mui/icons-material";
import Header from "./Header";

function MainLayout( ) {
  const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, role, setRole, user, setUser } =
    useAuth();
  const [selectedIndex, setSelectedIndex] = useState('');

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
  };


  const logout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        setAuthUser(null);
        setRole(null);
        setUser(null);
      })
      .catch((error) => {});
  };


  const navs = [
    {
      link: "/",
      name: "Home",
      icon: <Home sx={{
        color: "#00cbcb"
      }} />,
      index: 0,
      roles: ["admin", "technician", "receptionist", "thirdparty"],
    },
    {
      link: "bookings",
      name: "Bookings",
      icon: <BiotechIcon sx={{
        color: "#00cbcb"
      }} />,
      index: 1,
      roles: ["admin", "technician", "receptionist", "thirdparty"],
    },
    {
      link: "thirdparty",
      name: "Doctors & Hospitals",
      icon: <LocalHospital sx={{
        color: "#00cbcb"
      }} />,
      index: 2,
      roles: ["admin", "receptionist"],
    },
    {
      link: "masters",
      name: "Masters",
      icon: <Widgets sx={{
        color: "#00cbcb"
      }} />,
      index: 3,
      roles: ["admin", "technician", "receptionist"],
    },
    {
      link: "usersandpermissions",
      name: "Users and Permissions",
      icon: <PeopleAlt sx={{
        color: "#00cbcb"
      }} />,
      index: 4,
      roles: ["admin"],
    },
    {
      link: "templates",
      name: "Templates",
      icon: <Feed sx={{ 
        color: "#00cbcb"
       }} />,
      index: 5,
      roles: ["admin"],
    },
  ];


  return (
    <div style={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
            flexDirection: "column",
          }}
        >
          <img
            src="logo.png" // Replace with your logo image URL
            alt="Logo"
            style={{ height: "70%"}}
          />
          <Typography style={{ marginTop: "20px", textAlign: "center" }} variant="h5">
            Dr. Avani's Oncopath Lab App
          </Typography>
        </div>
        <List>
          {navs
            .filter((nav) => role && nav.roles.includes(role))
            .map((nav, index) => {
              return (
                <ListItemButton
                  disableTouchRipple
                  disableGutters
                  selected={selectedIndex.index === index}
                  onClick={() => handleListItemClick(nav)}
                  sx={{
                    borderRadius: "10px",
                    margin: "5px",
                    padding: "0px",
                    "&.MuiListItemButton-root:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                    "&:Mui-selected:hover": { backgroundColor: "blue" },
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <NavLink
                    style={{
                      display: "flex",
                      width: "100%",
                      minHeight: "48px",
                      alignItems: "center",
                    }}
                    to={nav.link}
                  >
                    <ListItemIcon
                      // style={{ justifyContent: "center", alignItems: "center" }}
                      sx={{
                        justifyContent: "center",
                        alignItems: "center",
                        
                      }}
                    >
                      {nav.icon}
                    </ListItemIcon>
                    <ListItemText primary={nav.name} />
                  </NavLink>
                </ListItemButton>
              );
            })}
        </List>
        <div>
          <Button onClick={logout} startIcon={<LogoutOutlined />}>
            Log Out
          </Button>
        </div>
      </Drawer>

      {/* Main Content */}
      <main
        style={{
          height: "calc(100vh - 64px)",
          display: "flex",
          width: "calc(100vw - 240px)",
          flexDirection: "column",
        }}
      >
        <Header title={selectedIndex === "" ? "Home" : selectedIndex.name} />
        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
