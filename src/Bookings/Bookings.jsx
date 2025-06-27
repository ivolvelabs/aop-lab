import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/material";
import CurrentBookings from "./CurrentBookings";
import PastBookings from "./PastBookings";
import React, { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import ResultAuthorised from "./ResultAuthorised";
import ThirdPartyReports from "./ThirdPartyReports";
import ThirdPartyReportsTest from "./ThirdPartyReportsTest";

const Bookings = () => {
    const { isLoggedIn, authUser, role } = useAuth();
    // console.log(authUser);
    // console.log(role);

  const [activeTab, setActiveTab] = useState(0); // Set initial active tab

  const tabs = [
    { label: "Current Bookings", component: <CurrentBookings /> },
    { label: "Past Bookings", component: <PastBookings /> },
  ];

  return (
    <div>
      {role === "thirdparty" ? (
        // <ThirdPartyReports />
        <ThirdPartyReportsTest />
      ) : (
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
      )}
    </div>
  );
};

export default Bookings;
