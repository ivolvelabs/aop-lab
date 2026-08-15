import { AppBar, Box, Chip, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";

const Header = ({ title, onMenuClick, menuIcon, role, user }) => {
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 1.5 }}>
          {onMenuClick ? (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{
                mr: 0.5,
                border: "1px solid rgba(148, 163, 184, 0.34)",
                borderRadius: 2,
              }}
              aria-label="Open navigation"
            >
              {menuIcon}
            </IconButton>
          ) : null}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: "text.primary",
              fontWeight: 800,
              lineHeight: 1.1,
              fontSize: { xs: "1.15rem", sm: "1.35rem", md: "1.55rem" },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}
          >
            Avnis Oncopathology Lab operations
          </Typography>
        </Box>
        <Chip
          label={displayRole}
          size="small"
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            bgcolor: "rgba(0, 102, 203, 0.08)",
            color: "primary.main",
            display: { xs: "none", sm: "inline-flex" },
          }}
        />
        {user?.name ? (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}
          >
            {user.name}
          </Typography>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
