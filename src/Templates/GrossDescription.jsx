import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Snackbar,
  CardActions,
  IconButton,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import { Delete, Search } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import JoditEditor from "jodit-react";

const GrossDescriptionTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTemplateDialogOpen, setAddTemplateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setGrossDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [deleteLoading, setDeleteLoading] = useState(false); // Track delete loader state
const [openSnackbar, setOpenSnackbar] = useState(false); // Track snackbar state
const [snackbarMsg, setSnackbarMsg] = useState("");


  const theme = useTheme();

  useEffect(() => {
    const q = query(
      collection(db, "grossDescriptionTemplates"),
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
      console.log(filteredTemplates);
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
    setGrossDescription("");
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        name,
        description,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "grossDescriptionTemplates"), templateData);
      handleCloseAddTemplateDialog();
    } catch (error) {
      console.error("Error adding template:", error);
    } finally {
      setLoading(false);
    }
  };

const handleDeleteTemplate = async (templateId) => {
  setDeleteLoading(true); // Show delete loader
  try {
    await deleteDoc(doc(db, "grossDescriptionTemplates", templateId));
    setTemplates(templates.filter((template) => template.id !== templateId)); // Update local state
    setOpenSnackbar(true); // Show success snackbar
    setSnackbarMsg("Template deleted successfully!");
  } catch (error) {
    console.error("Error deleting template:", error);
    setOpenSnackbar(true); // Show error snackbar
    setSnackbarMsg("Error deleting template. Please try again.");
  } finally {
    setDeleteLoading(false); // Hide delete loader
  }
};

const handleSnackbarClose = (event, reason) => {
  if (reason === "clickaway") {
    return;
  }
  setOpenSnackbar(false);
};

const editor = useRef(null);
  // const onChange = (value) => {};


const config = useMemo(
  () => ({
    readonly: false, // all options from https://xdsoft.net/jodit/docs/,
    // placeholder: bookingData.grossDescription || "Start typing...",
  }),
  []
);

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
        <DialogTitle>Add Gross Description Template</DialogTitle>
        <DialogContent>
          <TextField
            error={name === ""}
            style={{ marginBottom: "10px" }}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <JoditEditor
            ref={editor}
            value={description}
            config={config}
            tabIndex={1} // tabIndex of textarea
            onChange={(newContent) => setGrossDescription(newContent)} // preferred to use only this option to update the content for performance reasons
            // onBlur={(newContent) => setGrossDescription(newContent)}
            // onBlur={(newContent) => setContent(newContent)}
          />
          {/* <TextField
            error={description === ""}
            multiline
            minRows={4}
            label="Gross Description"
            value={description}
            onChange={(e) => setGrossDescription(e.target.value)}
            fullWidth
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTemplateDialog}>Cancel</Button>
          <Button
            disabled={name.trim() === "" || description.trim() === ""}
            // disabled={name.trim() === ""}
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
                    {/* <Typography variant="body2">
                      {template.description}
                    </Typography> */}
                    <div
                      dangerouslySetInnerHTML={{ __html: template.description }}
                    />

                    {/* You can add more content to the card based on your template data */}
                  </CardContent>
                  <CardActions>
                    <IconButton
                      // sx={{ position: "absolute", top: 10, right: 10 }}
                      onClick={() => handleDeleteTemplate(template.id)}
                      disabled={deleteLoading} // Disable button while deleting
                    >
                      {deleteLoading ? (
                        <CircularProgress size={24} /> // Show loader during delete
                      ) : (
                        <Delete color="error" /> // Replace with your preferred delete icon
                      )}
                    </IconButton>
                  </CardActions>
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={snackbarMsg}
        // action={action}
      />
    </div>
  );
};

export default GrossDescriptionTemplates;