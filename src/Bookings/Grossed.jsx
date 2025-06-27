import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Grid,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
// import ReactDOM from "react-dom";
// import { Editor, EditorState } from "draft-js";
// import "draft-js/dist/Draft.css";
import JoditEditor from "jodit-react";




const Grossed = ({
  bookingData,
  onSave,
  statesInfo,
  updateStatesInfo,
  handleUpdateStatesInfo,
}) => {
  const [grossDescriptionTemplates, setGrossDescriptionTemplates] = useState(
    []
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [grossDescription, setGrossDescription] = useState(
    bookingData?.grossDescription ? bookingData?.grossDescription : ""
  );
  const [isLoading, setIsLoading] = useState(true); // Track loading state

const editor = useRef(null);

const config = useMemo(
  () => ({
    readonly: false, // all options from https://xdsoft.net/jodit/docs/,
    placeholder: bookingData.grossDescription || "Start typings...",
  }),
  [bookingData.grossDescription]
);


  useEffect(() => {
    setIsLoading(true); // Set loading initially
    console.log(bookingData);
    if (bookingData.grossDescription) {
      setGrossDescription(bookingData.grossDescription || "");
    } else {
      console.error("Booking not found:", bookingData.id);
    }
    getDocs(collection(db, "grossDescriptionTemplates"))
      .then((querySnapshot) => {
        const templates = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGrossDescriptionTemplates(templates);
        setIsLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
        setIsLoading(false); // Set loading to false even on error
      });
  }, [bookingData.id, bookingData.grossDescription ]);

  const handleTemplateChange = (event) => {
    const selectedTemplateData = grossDescriptionTemplates.find(
      (template) => template.id === event.target.value
    );
    setSelectedTemplateId(event.target.value);
    // console.log(selectedTemplateData?.description);
    setGrossDescription(selectedTemplateData?.description || "");
  };

  const handleSave = async () => {
    setIsLoading(true); // Set loading while saving
    const bookingRef = await doc(db, "bookings", bookingData.id);

    try {
      if (statesInfo) {
        const updatedStatesInfo = await statesInfo.map((state) => {
          if (state.state === "grossed") {
            return {
              ...state,
              isDone: true,
              updatedAt: new Date(),
            };
          }
          return state;
        });
        handleUpdateStatesInfo(updatedStatesInfo);
        await updateDoc(bookingRef, {
          grossDescription,
          // rteData: content,
          statesInfo: updatedStatesInfo,
        });
      } else {
        console.error("statesInfo is undefined, cannot update states");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false); // Set loading to false after saving (or error)
    }
  };

  const onChange = (value) => {};

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Grossing Information</Typography>
      </Grid>
      <Grid item xs={12}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div>
            {/* <MyEditor /> */}
            {/* <JoditEditor
              ref={editor}
              value={grossDescription}
              config={config}
              tabIndex={1} // tabIndex of textarea
              onChange={(newContent) => setGrossDescription(newContent)} // preferred to use only this option to update the content for performance reasons
              // onBlur={(newContent) => setGrossDescription(newContent)}
              // onBlur={(newContent) => setContent(newContent)}
            /> */}
            {/* <div dangerouslySetInnerHTML={{ __html: grossDescription }} /> */}
            <InputLabel id="gross-description-label">
              Select Gross Description Template
            </InputLabel>
            <Select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              label="Select Gross Description Template"
              fullWidth
              labelId="gross-description-label"
              name="template"
            >
              {grossDescriptionTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        )}
      </Grid>
      <Grid item xs={12}>
        <JoditEditor
          ref={editor}
          value={grossDescription}
          config={config}
          tabIndex={1} // tabIndex of textarea
          onChange={(newContent) => setGrossDescription(newContent)} // preferred to use only this option to update the content for performance reasons
          // onBlur={(newContent) => setGrossDescription(newContent)}
          // onBlur={(newContent) => setContent(newContent)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" disabled={isLoading} onClick={handleSave}>
          Save
        </Button>
      </Grid>
    </Grid>
  );
};

export default Grossed;