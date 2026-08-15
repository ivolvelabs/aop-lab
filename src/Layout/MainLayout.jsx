import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
  Box,
  useMediaQuery,
  Divider,
  Chip,
} from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import { Feed, Home, LocalHospital, LogoutOutlined, PeopleAlt, Widgets } from "@mui/icons-material";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import "./MainLayout.css";
import { useAuth } from "../Contexts/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Header from "./Header";
import { useTheme } from "@mui/material/styles";
import { NAV_ITEMS } from "../config/navigation";

function MainLayout() {
  const { setAuthUser, setIsLoggedIn, role, setRole, setUser, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const iconByKey = {
    home: <Home />,
    bookings: <BiotechIcon />,
    thirdparty: <LocalHospital />,
    masters: <Widgets />,
    users: <PeopleAlt />,
    templates: <Feed />,
  };

  const getPageTitle = () => {
    const match = NAV_ITEMS.find((nav) =>
      nav.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(nav.path)
    );

    if (match) return match.name;
    if (location.pathname.startsWith("/bookings/")) return "Booking Details";
    if (location.pathname.startsWith("/myBookings/")) return "Report";
    return "Home";
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setAuthUser(null);
      setRole(null);
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderNavList = () => (
    <List sx={{ px: 1.25, py: 1 }}>
      {NAV_ITEMS
        .filter((nav) => role && nav.roles.includes(role))
        .map((nav) => {
          const isSelected =
            nav.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(nav.path);

          return (
            <ListItemButton
              key={nav.path}
              disableTouchRipple
              disableGutters
              selected={isSelected}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                p: 0,
                color: isSelected ? "white" : "rgba(226, 232, 240, 0.86)",
                "&.MuiListItemButton-root:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
                "&.Mui-selected:hover": { backgroundColor: "primary.main" },
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, rgba(0,102,203,1), rgba(0,203,203,0.92))",
                  color: "white",
                  boxShadow: "0 12px 30px rgba(0, 102, 203, 0.28)",
                },
              }}
            >
              <NavLink
                style={{
                  display: "flex",
                  width: "100%",
                  minHeight: "48px",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                }}
                to={nav.path}
              >
                <ListItemIcon
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    color: "inherit",
                    minWidth: 48,
                  }}
                >
                  {iconByKey[nav.icon]}
                </ListItemIcon>
                <ListItemText
                  primary={nav.name}
                  primaryTypographyProps={{ fontWeight: isSelected ? 800 : 600 }}
                />
              </NavLink>
            </ListItemButton>
          );
        })}
    </List>
  );

  const drawerContent = (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          p: 2,
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "white",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.22)",
              overflow: "hidden",
            }}
          >
            <img
              src="/logo.png"
              alt="Avnis Oncopathology Lab"
              style={{ width: "42px", height: "42px", objectFit: "contain" }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "white", fontWeight: 900, lineHeight: 1.1 }} variant="subtitle1">
              Avnis Oncopath
            </Typography>
            <Typography sx={{ color: "rgba(226, 232, 240, 0.72)" }} variant="caption">
              Lab operations suite
            </Typography>
          </Box>
        </Box>
        <Chip
          label={role ? `${role} access` : "loading access"}
          size="small"
          sx={{
            mt: 2,
            color: "rgba(226, 232, 240, 0.95)",
            bgcolor: "rgba(255,255,255,0.09)",
            borderRadius: 2,
            fontWeight: 700,
          }}
        />
      </Box>
      <Divider sx={{ borderColor: "rgba(226, 232, 240, 0.12)" }} />
      {renderNavList()}
      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Button
          fullWidth
          onClick={logout}
          startIcon={<LogoutOutlined />}
          sx={{
            justifyContent: "flex-start",
            color: "rgba(226, 232, 240, 0.9)",
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" },
          }}
        >
          Log Out
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
              overflowX: "hidden",
              border: 0,
              background:
                "linear-gradient(180deg, #0f172a 0%, #132238 48%, #0b1220 100%)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
              overflowX: "hidden",
              border: 0,
              background:
                "linear-gradient(180deg, #0f172a 0%, #132238 48%, #0b1220 100%)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          width: isDesktop ? "calc(100vw - 240px)" : "100vw",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header
          title={getPageTitle()}
          onMenuClick={isDesktop ? undefined : () => setMobileOpen(true)}
          menuIcon={<MenuIcon />}
          role={role}
          user={user}
        />
        <div
          style={{
            padding: isDesktop ? "24px" : "14px",
            overflow: "auto",
            minHeight: 0,
            flex: 1,
          }}
        >
          <Outlet />
        </div>
      </main>
    </Box>
  );
}

export default MainLayout;
