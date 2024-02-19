import React, { useState, useEffect } from "react";

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase"; // Assuming your Firestore instance is imported here
import { useTheme } from "@emotion/react";

const ItemNames = () => {
  const theme = useTheme();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [itemNames, setItemNames] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [dialogCategoryId, setDialogCategoryId] = useState("");
  const [dialogSubcategoryId, setDialogSubcategoryId] = useState("");
  const [dialogItemName, setDialogItemName] = useState("");
  const [allSubcategories, setAllSubcategories] = useState([]); // State for all subcategories
  const [filteredSubcategories, setFilteredSubcategories] = useState([]); // State for filtered subcategories

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("name", "desc"));
      const snapshot = await getDocs(q);

      setCategories(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
    setSubcategories([]); // Reset subcategories when category changes
    setSelectedSubcategoryId(""); // Reset selected subcategory
  };

  // Fetch subcategories only when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubcategories = async () => {
        const q = query(
          collection(db, "categories", selectedCategoryId, "subcategories"),
          orderBy("name", "desc")
        );
        const snapshot = await getDocs(q);

        setSubcategories(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      };

      fetchSubcategories();
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSubcategoryId) {
      const fetchItemNames = async () => {
        const q = query(
          collection(
            db,
            "categories",
            selectedCategoryId,
            "subcategories",
            selectedSubcategoryId,
            "itemNames"
          ),
          orderBy("name", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setItemNames(
            snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          );
        });

        return () => unsubscribe(); // Cleanup on unmount
      };

      fetchItemNames();
    } else {
      setItemNames([]);
    }
  }, [selectedSubcategoryId, selectedCategoryId]);

  // const handleCategoryChange = (event) => {
  //   setSelectedCategoryId(event.target.value);
  // };

  const handleSubcategoryChange = (event) => {
    setSelectedSubcategoryId(event.target.value);
  };

  const handleNewItemNameChange = (event) => {
    setNewItemName(event.target.value);
  };

  const handleAddItemDialogOpen = () => {
    setOpenAddItemDialog(true);
    setDialogCategoryId(""); // Reset dialog selections
    setDialogSubcategoryId("");
    setDialogItemName("");
  };

  const handleAddItemDialogClose = () => {
    setOpenAddItemDialog(false);
  };

  const handleDialogCategoryChange = async (event) => {
    setDialogCategoryId(event.target.value);
    // Fetch all subcategories based on selected category
    const q = query(
      collection(db, "categories", event.target.value, "subcategories"),
      orderBy("name", "desc")
    );
    try {
      const snapshot = await getDocs(q);
      console.log(snapshot.docs);
      setAllSubcategories(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setDialogSubcategoryId("");
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleDialogSubcategoryChange = (event) => {
    setDialogSubcategoryId(event.target.value);
  };

  const handleDialogItemNameChange = (event) => {
    setDialogItemName(event.target.value);
  };

  const handleSaveItem = async () => {
    // if (dialogItemName.trim() !== "") {
      try {
        setLoading(true);

        const itemRef = collection(
          db,
          "categories",
          dialogCategoryId,
          "subcategories",
          dialogSubcategoryId,
          "itemNames"
        );
        await addDoc(itemRef, {
          name: dialogItemName,
          createdAt: serverTimestamp(),
        });

        handleAddItemDialogClose(); // Close dialog after saving
      } catch (error) {
        console.error("Error adding item name:", error);
      } finally {
        setLoading(false);
      }
    // }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Category selection */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        <FormControl
          sx={{ flex: 2, padding: "0px", margin: "10px" }}
          size="small"
        >
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            label="Select Category"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            // sx={{ flex: 2, padding: "0px" }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{ flex: 2, padding: "0px", margin: "10px" }}
          size="small"
        >
          <InputLabel id="category-select-label">Select Subcategory</InputLabel>

          <Select
            labelId="subcategory-select-label"
            id="subcategory-select"
            label="Select Subcategory"
            value={selectedSubcategoryId}
            onChange={(event) => setSelectedSubcategoryId(event.target.value)}
            disabled={!selectedCategoryId}
            // sx={{ flex: 2, padding: "0px" }}
          >
            {subcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddItemDialogOpen}
          sx={{ flex: 1 }}
        >
          Add Item Name
        </Button>
      </div>
      {/* Item name list */}
      {loading ? (
        <CircularProgress size={54} />
      ) : itemNames.length > 0 ? (
        <div>
          {/* <h2>Item Names</h2> */}
          <Grid container spacing={2}>
            {" "}
            {/* Use Grid for layout flexibility */}
            {itemNames.map((itemName) => (
              <Grid item xs={4} key={itemName.id}>
                <Card
                  sx={{ borderLeft: `${theme.palette.primary.main} 5px solid` }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        overflowWrap: "break-word",
                      }}
                      variant="h6"
                    >
                      {itemName.name}
                    </Typography>
                    {/* You can add more content to the card based on your subcategory data */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      ) : (
        <p>No item names found for this subcategory.</p>
      )}
      {/* Add item name form */}
      {/* <TextField
        label="Add new item name"
        value={newItemName}
        onChange={handleNewItemNameChange}
        disabled={!selectedSubcategoryId} // Disable if no subcategory selected
      /> */}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleAddItemDialogOpen}
      >
        Add Item Name
      </Button> */}
      <Dialog open={openAddItemDialog} onClose={handleAddItemDialogClose}>
        <DialogTitle>Add New Item Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a category and subcategory, then enter the item name.
          </DialogContentText>
          <Select
            labelId="dialog-category-select-label"
            id="dialog-category-select"
            label="Category"
            value={dialogCategoryId}
            onChange={handleDialogCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            labelId="dialog-subcategory-select-label"
            id="dialog-subcategory-select"
            label="Subcategory"
            value={dialogSubcategoryId}
            onChange={handleDialogSubcategoryChange}
            disabled={!dialogCategoryId} // Disable if no category selected
          >
            {allSubcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Item Name"
            value={dialogItemName}
            onChange={handleDialogItemNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddItemDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            color="primary"
            disabled={!dialogSubcategoryId || dialogItemName.trim() === ""}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ItemNames;
