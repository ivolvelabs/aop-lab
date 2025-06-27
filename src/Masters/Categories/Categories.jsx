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
  CardActions,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase"; // Assuming your Firestore instance is imported here
import { Search } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // const [categoryRn, setCategoryRn] = useState(0);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filteredCategories = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setCategories(
        filteredCategories.map((doc) => ({ ...doc.data(), id: doc.id }))
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleOpenAddCategoryDialog = () => {
    setAddCategoryDialogOpen(true);
  };

  const handleCloseAddCategoryDialog = () => {
    setAddCategoryDialogOpen(false);
    setName("");
  };

  const handleSaveCategory = async () => {
    try {
      const year = new Date().getFullYear().toString().substring(2);
      setLoading(true);
      const categoryData = {
        name,
        createdAt: serverTimestamp(),
        years: [
          {
            year: year,
            rnSeries: `AOP/${name.substring(0, 1).toUpperCase()}/${year}`,
            crNumber: 0,
          },
        ],
      };
      // const categoryData = {
      //   name,
      //   createdAt: serverTimestamp(),
      //   crnSeries: `AOP/${name.substring(0, 1).toUpperCase()}`,
      //   crNumber: "0",
      //   crnYear: year,
      // };
      const docRef = doc(collection(db, "categories"));
      await setDoc(docRef, {...categoryData, id: docRef.id});
      const q = query(
        collection(db, "categories"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setCategories(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
        handleCloseAddCategoryDialog();
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextField
            value={searchTerm}
            onChange={handleSearch}
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
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleOpenAddCategoryDialog}
          >
            {loading ? <CircularProgress size={24} /> : "Add Category"}
          </Button>
        </div>
      </div>

      <Dialog
        open={addCategoryDialogOpen}
        onClose={handleCloseAddCategoryDialog}
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCategoryDialog}>Cancel</Button>
          <Button disabled={name.trim() === ""} onClick={handleSaveCategory}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!loading && categories.length > 0 ? (
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={3} key={category.id}>
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
                      {category.name}
                    </Typography>
                    {/* You can add more content to the card based on your category data */}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/masters/${category.id}`);
                      }}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <p>
            {loading ? <CircularProgress size={54} /> : "No categories found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Category;
