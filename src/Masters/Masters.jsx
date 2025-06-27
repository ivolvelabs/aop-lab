
import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/material";
import Categories from "./Categories/Categories";
import SubCategories from "./SubCategories/SubCategories";
import ItemNames from "./ItemNames/ItemNames";
import React, { useState } from "react";

const Masters = () => {
  const [activeTab, setActiveTab] = useState(0); // Set initial active tab

  const tabs = [
    { label: "Pathology Test Category", component: <Categories /> },
    { label: "Specimen Type", component: <SubCategories /> },
    { label: "Item Names", component: <ItemNames /> },
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
      </Box>
    </div>
  );
};

export default Masters;