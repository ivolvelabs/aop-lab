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
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import { Search } from "@mui/icons-material";
import { useTheme } from "@emotion/react";

const DiagnosisTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTemplateDialogOpen, setAddTemplateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();

  useEffect(() => {
    const q = query(
      collection(db, "diagnosisTemplates"), // Assuming this is the correct collection name
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filteredTemplates = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return [data.name, data.description]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
      setTemplates(
        filteredTemplates.map((doc) => ({ ...doc.data(), id: doc.id }))
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleOpenAddTemplateDialog = () => {
    setAddTemplateDialogOpen(true);
  };

  const handleCloseAddTemplateDialog = () => {
    setAddTemplateDialogOpen(false);
    setName("");
    setDescription("");
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        name,
        description,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "diagnosisTemplates"), templateData);
      handleCloseAddTemplateDialog();
    } catch (error) {
      console.error("Error adding template:", error);
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
            onClick={handleOpenAddTemplateDialog}
          >
            {loading ? <CircularProgress size={24} /> : "Add Diagnosis Template"}
          </Button>
        </div>
      </div>

      <Dialog
        open={addTemplateDialogOpen}
        onClose={handleCloseAddTemplateDialog}
      >
        <DialogTitle>Add Diagnosis Template</DialogTitle>
        <DialogContent>
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          />
          <TextField
            error={description === ""}
            multiline
            minRows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          {/* You can add more relevant diagnosis-specific fields here, such as: */}
          {/* - ICD-10 code */}
          {/* - Associated symptoms */}
          {/* - Treatment options */}
          {/* - Prognosis */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTemplateDialog}>Cancel</Button>
          <Button
            disabled={name.trim() === "" || description.trim() === ""}
            onClick={handleSaveTemplate}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        {!loading && templates.length > 0 ? (
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} key={template.id}>
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
                      {template.name}
                    </Typography>
                    <Typography variant="body2">
                      {template.description}
                    </Typography>
                    {/* You can add more content to the card based on your specific diagnosis data */}
                    {/* For example, you could display the ICD-10 code or associated symptoms here. */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <p>
            {loading ? <CircularProgress size={54} /> : "No templates found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default DiagnosisTemplates;