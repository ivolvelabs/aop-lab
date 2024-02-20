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

const SpecimenTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTemplateDialogOpen, setAddTemplateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [specimenType, setSpecimenType] = useState("");
  const [specimenSource, setSpecimenSource] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();

  useEffect(() => {
    const q = query(
      collection(db, "specimenTemplates"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filteredTemplates = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return [data.name, data.specimenType, data.specimenSource]
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
    setSpecimenType("");
    setSpecimenSource("");
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        name,
        specimenType,
        specimenSource,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "specimenTemplates"), templateData);
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
            {loading ? <CircularProgress size={24} /> : "Add Template"}
          </Button>
        </div>
      </div>

      <Dialog
        open={addTemplateDialogOpen}
        onClose={handleCloseAddTemplateDialog}
      >
        <DialogTitle>Add Specimen Template</DialogTitle>
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
            error={specimenType === ""}
            style={{ marginBottom: "10px" }}
            label="Specimen Type"
            value={specimenType}
            onChange={(e) => setSpecimenType(e.target.value)}
            fullWidth
          />
          <TextField
            error={specimenSource === ""}
            style={{ marginBottom: "10px" }}
            label="Specimen Source"
            value={specimenSource}
            onChange={(e) => setSpecimenSource(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTemplateDialog}>Cancel</Button>
          <Button
            disabled={
              name.trim() === "" ||
              specimenType.trim() === "" ||
              specimenSource.trim() === ""
            }
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
                      Specimen Type: {template.specimenType}
                    </Typography>
                    <Typography variant="body2">
                      Specimen Source: {template.specimenSource}
                    </Typography>
                    {/* You can add more content to the card based on your template data */}
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

export default SpecimenTemplates;