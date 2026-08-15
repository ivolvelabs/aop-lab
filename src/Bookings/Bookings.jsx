import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import CurrentBookings from "./CurrentBookings";
import PastBookings from "./PastBookings";
import React, { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import ThirdPartyReportsTest from "./ThirdPartyReportsTest";

const Bookings = () => {
  const { role } = useAuth();

  const [activeTab, setActiveTab] = useState(0); // Set initial active tab

  const tabs = [
    { label: "Current Bookings", component: <CurrentBookings /> },
    { label: "Past Bookings", component: <PastBookings /> },
  ];

  return (
    <Box>
      {role === "thirdparty" ? (
        // <ThirdPartyReports />
        <ThirdPartyReportsTest />
      ) : (
        <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>
            Booking Registry
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": { minHeight: 44, fontWeight: 800 },
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Paper>
      )}
      {role !== "thirdparty" ? <Box>{tabs[activeTab].component}</Box> : null}
    </Box>
  );
};

export default Bookings;
