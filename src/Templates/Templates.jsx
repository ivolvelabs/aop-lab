import React, { useState } from "react";
import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/material";
import Specimen from "./Specimen"; // Replace with your component
import Diagnosis from "./Diagnosis"; // Replace with your component
import MicroscopicDescription from "./MicroscopicDescription"; // Replace with your component
import GrossDescription from "./GrossDescription"; // Replace with your component
import ListOfSections from "./ListOfSections"; // Replace with your component

const Templates = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
      { label: "Specimen", component: <Specimen /> },
      { label: "Diagnosis", component: <Diagnosis /> },
    { label: "Microscopic Description", component: <MicroscopicDescription /> },
    { label: "Gross Description", component: <GrossDescription /> },
    { label: "List of Sections", component: <ListOfSections /> },
  ];

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={activeTab} onChange={handleChange}>
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      {/* <TabPanel value={activeTab} index={0}>
        {tabs[activeTab].component}
      </TabPanel> */}
      <Box>{tabs[activeTab].component} </Box>
    </Box>
  );
};

export default Templates;
