import { Box, Tab, Tabs } from "@mui/material";
 // Assuming your hospital component path
import Doctors from "./Doctors"; // Assuming your doctor component path
import React, { useState } from "react";
import ThirdPartyHospitals from "./ThirdPartyHospitals";

const Masters = () => {
  const [activeTab, setActiveTab] = useState(0); // Set initial active tab

  const tabs = [
    { label: "Hospitals", component: <ThirdPartyHospitals /> }, // New tab for hospitals
    { label: "Doctors", component: <Doctors /> }, // New tab for doctors
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

export default Masters;
