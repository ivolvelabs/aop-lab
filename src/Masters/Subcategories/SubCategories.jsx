import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase"; // Assuming your Firestore instance is imported here
import { Search } from "@mui/icons-material";
import { useTheme } from "@emotion/react";

const SubCategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] =
    useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setAvailableCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const theme = useTheme();

  useEffect(() => {
    setLoading(true);

    // Fetch all categories and sort them by name in descending order
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("name", "desc"));
      const snapshot = await getDocs(q);

      setAvailableCategories(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setLoading(false);
    };

    fetchCategories();
  }, []);


useEffect(() => {
  const fetchAndFilterSubcategories = async () => {
    if (!selectedCategoryId) {
      return; // Skip fetching if no category is selected
    }
    try {
      setLoading(true);

      const q = query(
        collection(db, "categories", selectedCategoryId, "subcategories"),
        orderBy("name", "desc")
      );
      const querySnapshot = await getDocs(q);
      setSubcategories(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAndFilterSubcategories();

  // Cleanup on unmount
  return () => {};
}, [selectedCategoryId, searchTerm]);



  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
  };

  const handleOpenAddSubcategoryDialog = () => {
    setAddSubcategoryDialogOpen(true);
  };

  const handleCloseAddSubcategoryDialog = () => {
    setAddSubcategoryDialogOpen(false);
    setName("");
    setCategory("");
  };


  const handleSaveSubcategory = async () => {
    try {
      setLoading(true);
      const categoryDoc = await getDoc(doc(db, "categories", category));
      const subcollectionRef = collection(categoryDoc.ref, "subcategories");

      const subcategoryData = {
        name,
        createdAt: serverTimestamp(),
      };
      await addDoc(subcollectionRef, subcategoryData);

      // Fetch subcategories directly within the function
      const q = query(subcollectionRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setSubcategories(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
        // setLoading(false);
        handleCloseAddSubcategoryDialog();
      });

      // Remember to unsubscribe when necessary
      return () => unsubscribe();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <div style={{  flex: 2 }}> */}
        <FormControl
          size="small"
          sx={{ width: "100%", flex: "2", margin: "10px" }}
        >
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            label="Select Category"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
          >
            {/* <MenuItem value="">All Categories</MenuItem> */}
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* </div> */}
        {/* <div style={{  flex: 2 }}> */}
        <TextField
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: "2", margin: "10px" }}
          type="search"
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {/* </div> */}
        {/* <div style={{  flex: 1 }}> */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddSubcategoryDialog}
          sx={{ flex: "1" }}
        >
          Add Subcategory
        </Button>
        {/* </div> */}
      </div>

      <Dialog
        open={addSubcategoryDialogOpen}
        onClose={handleCloseAddSubcategoryDialog}
      >
        <DialogTitle>Add Subcategory</DialogTitle>
        <DialogContent>
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="category-select-label">Select Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSubcategoryDialog}>Cancel</Button>
          <Button
            disabled={name.trim() === "" || category === ""}
            onClick={handleSaveSubcategory}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!loading && subcategories.length > 0 ? (
          <Grid container spacing={2}>
            {subcategories.map((subcategory) => (
              <Grid item xs={3} key={subcategory.id}>
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
                      {subcategory.name}
                    </Typography>
                    {/* You can add more content to the card based on your subcategory data */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <p>
            {loading && subcategories.length === 0 ? (
              <CircularProgress size={54} />
            ) : (
              "No subcategories found."
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubCategories;