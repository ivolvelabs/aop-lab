import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/material";
import CurrentBookings from "./CurrentBookings";
import PastBookings from "./PastBookings";
import React, { useState } from "react";

const Bookings = () => {
  const [activeTab, setActiveTab] = useState(0); // Set initial active tab

  const tabs = [
    { label: "Current Bookings", component: <CurrentBookings /> },
    { label: "Past Bookings", component: <PastBookings /> },
  ];

  return (
    <div>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      <Box>
        {tabs[activeTab].component}{" "}
        {/* Only render the active tab's component */}
      </Box>
    </div>
  );
};

export default Bookings;
