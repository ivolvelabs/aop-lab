import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import { Delete } from "@mui/icons-material";
import JoditEditor from "jodit-react";

const ResultEntered = ({ bookingData, statesInfo, handleUpdateStatesInfo }) => {
  const [resultEnteredDetails, setResultEnteredDetails] = useState(
    bookingData?.resultEnteredDetails || {}
  );
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [microscopicDescriptionOptions, setMicroscopicDescriptionOptions] =
    useState([]);
  const [grossDescription, setGrossDescription] = useState(
    bookingData?.grossDescription ? bookingData?.grossDescription : ""
  );
  const [listOfSectionsDetails, setListOfSectionsDetails] = useState([
    bookingData?.listOfSectionsDetails || [],
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState(
    bookingData?.comments ? bookingData?.comments : ""
  );

  useEffect(() => {
    setIsLoading(true);

    const setData = async ()=> {

      // //(await bookingData.resultEnteredDetails);
      // //(await bookingData + "bd------");
      // //(await bookingData.age + "bd age------");

      if (bookingData.resultEnteredDetails) {
        setResultEnteredDetails(bookingData.resultEnteredDetails);
      } else {
        setResultEnteredDetails({});
        console.error("Result entered not found:", bookingData.id);
      }
  
      if (bookingData.grossDescription) {
        setGrossDescription(bookingData.grossDescription || "");
      } else {
        console.error("grossDescription not found:", bookingData.id);
      }
  
      if (bookingData.listOfSectionsDetails) {
        setListOfSectionsDetails(bookingData.listOfSectionsDetails);
      } else {
        setListOfSectionsDetails([]);
        console.error("LOS not found:", bookingData.id);
      }
      if (bookingData.comments) {
        setComments(bookingData.comments || "");
      }
    }


    const fetchCollections = async () => {
      const diagnosisSnapshot = await getDocs(
        collection(db, "diagnosisTemplates")
      );
      const microscopicDescriptionSnapshot = await getDocs(
        collection(db, "microscopicDescriptionTemplates")
      );
      
      setDiagnosisOptions(
        diagnosisSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
        }))
      );
      setMicroscopicDescriptionOptions(
        microscopicDescriptionSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
        }))
      );

      // if ( bookingData?.slideDeliveredDetails?.he?.he) {
        // //(
        //   bookingData?.listOfSectionsDetails?.length ===
        //     parseInt(bookingData?.slideDeliveredDetails?.he?.he)
        // );
        // //(bookingData?.listOfSectionsDetails?.length);
        // //(parseInt(bookingData?.slideDeliveredDetails?.he?.he));
        if (
          ( bookingData?.listOfSectionsDetails?.length) ===
           parseInt(bookingData?.slideDeliveredDetails?.he?.he)
        ) {
          return;
        } else {
          // //(...Array(parseInt(await bookingData?.slideDeliveredDetails?.he?.he)));
          const res = [
            ...Array(parseInt(bookingData?.slideDeliveredDetails?.he?.he)),
          ].map((_, i) => {
            return {
              prefix: "Cassette",
              name: listOfSectionsDetails[i]?.name || "",
              description:
                listOfSectionsDetails[i]?.description || "",
            };
          });
          //(res);
          setListOfSectionsDetails(res);
        }
      // }
    };
    setData();
    fetchCollections().then(() => setIsLoading(false));
  }, [bookingData]);

  const handleDropdownChange = (event, templateOptions, field) => {
    const selectedOption = templateOptions.find(
      (option) => option.description === event.target.value
    );
    //(selectedOption);
    if (selectedOption) {
      setResultEnteredDetails({
        ...resultEnteredDetails,
        [field]: selectedOption.description,
      });
      //(resultEnteredDetails);
    }
  };

  const handleTextFieldChange = (index) => (event) => {
    const updatedList = [...listOfSectionsDetails];
    const { name, value } = event.target;
    if (name === "name") {
      updatedList[index].name = value;
    } else if (name === "description") {
      updatedList[index].description = value;
    }
    setListOfSectionsDetails(updatedList);
  };

  const handleResultEnteredTextFieldChange = (event) => {
    const { name, value } = event.target;
    setResultEnteredDetails({ ...resultEnteredDetails, [name]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const bookingRef = doc(db, "bookings", bookingData.id);

    try {
      const updatedStatesInfo = statesInfo.map((state) => {
        if (state.state === "resultEntered") {
          return {
            ...state,
            isDone: true,
            updatedAt: new Date(),
          };
        }
        return state;
      });
      handleUpdateStatesInfo(updatedStatesInfo);
      const updates = {
        resultEnteredDetails,
        listOfSectionsDetails,
        statesInfo: updatedStatesInfo,
        grossDescription: grossDescription,
        comments: comments,
      };

      await updateDoc(bookingRef, updates);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  };

const grossDescriptionRef = useRef(null);
const specimenRef = useRef(null);
const diagnosisRef = useRef(null);
const microscopyRef = useRef(null);
// const onChange = (value) => {};

const config = useMemo(
  () => ({
    readonly: false, // all options from https://xdsoft.net/jodit/docs/,
    // placeholder: bookingData.grossDescription || "Start typing...",
  }),
  []
);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexDirection="column" width="100%">
        <Typography variant="h4">Result Entered Information</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Grid container spacing={2}>
              {/* <Grid item xs={12}>
               
              </Grid> */}
              <Grid item xs={12}>
                <InputLabel sx={{ fontSize: "20px", color: "black" }}>
                  Gross Description
                </InputLabel>
                <JoditEditor
                  // style={{ width: "90%" }}
                  ref={grossDescriptionRef}
                  value={grossDescription}
                  config={config}
                  tabIndex={1} // tabIndex of textarea
                  onChange={(newContent) => setGrossDescription(newContent)} // preferred to use only this option to update the content for performance reasons
                />
              </Grid>

              <Grid item xs={12}>
                <InputLabel sx={{ fontSize: "20px", color: "black" }}>
                  Specimen
                </InputLabel>
                <JoditEditor
                  // style={{ width: "90%" }}
                  ref={specimenRef}
                  value={resultEnteredDetails.specimen}
                  config={config}
                  tabIndex={1} // tabIndex of textarea
                  onChange={(newContent) =>
                    setResultEnteredDetails({
                      ...resultEnteredDetails,
                      specimen: newContent,
                    })
                  } // preferred to use only this option to update the content for performance reasons
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl style={{ margin: "0px", width: "100%" }}>
                  <InputLabel sx={{ fontSize: "20px", color: "black" }}>
                    Select Diagnosis Template
                  </InputLabel>
                  <Select
                    value={resultEnteredDetails.diagnosis || ""}
                    onChange={(event) =>
                      handleDropdownChange(event, diagnosisOptions, "diagnosis")
                    }
                    fullWidth
                  >
                    {diagnosisOptions.map((option) => (
                      <MenuItem key={option.id} value={option.description}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <InputLabel sx={{ fontSize: "20px", color: "black" }}>
                  Diagnosis Description
                </InputLabel>

                <JoditEditor
                  ref={diagnosisRef}
                  value={resultEnteredDetails.diagnosis}
                  config={config}
                  tabIndex={1} // tabIndex of textarea
                  onChange={(newContent) =>
                    setResultEnteredDetails({
                      ...resultEnteredDetails,
                      diagnosis: newContent,
                    })
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl style={{ margin: "0px", width: "100%" }}>
                  <InputLabel sx={{ fontSize: "20px", color: "black" }}>
                    Select Microscopy Template
                  </InputLabel>
                  <Select
                    labelId="microscopic-description-label"
                    id="microscopic-description"
                    label="Microscopic Description"
                    value={resultEnteredDetails.microscopicDescription || ""}
                    onChange={(event) =>
                      handleDropdownChange(
                        event,
                        microscopicDescriptionOptions,
                        "microscopicDescription"
                      )
                    }
                    fullWidth
                  >
                    {microscopicDescriptionOptions.map((option) => (
                      <MenuItem key={option.id} value={option.description}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <InputLabel sx={{ fontSize:"20px", color: "black" }}>Microscopy Description</InputLabel>
                
                <JoditEditor
                style={{ width: "50%" }}
                // width="50%"
                  ref={microscopyRef}
                  value={resultEnteredDetails.microscopicDescription}
                  config={config}
                  tabIndex={1} // tabIndex of textarea
                  onChange={(newContent) =>
                    setResultEnteredDetails({
                      ...resultEnteredDetails,
                      microscopicDescription: newContent,
                    })
                  }
                  
                />
              </Grid>

              <Grid item xs={12} rowGap={2}>
                <InputLabel sx={{ fontSize:"20px", color: "black" }}>List Of Sections</InputLabel>
                {listOfSectionsDetails?.map((los, index) => {
                  return (
                    <>
                      <TextField
                        label={`H&E Slide-${index + 1}`}
                        id={`adornment-prefix-${index}`}
                        // name={los.name}
                        name="name"
                        value={los?.name || ""}
                        onChange={handleTextFieldChange(index)}
                        sx={{ mt: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {los.prefix}
                            </InputAdornment>
                          ),
                        }}
                        variant="filled"
                      />
                      <TextField
                        sx={{ mt: 1 }}
                        label={`H&E Slide-${index + 1} description`}
                        name="description"
                        value={los?.description || ""}
                        onChange={handleTextFieldChange(index)}
                        fullWidth
                      />
                    </>
                  );
                })}
              </Grid>
              <Grid item xs={12}>
                <InputLabel sx={{ fontSize:"20px", color: "black" }}>Comment</InputLabel>
                <TextField
                  variant="filled"
                  onChange={(event) => setComments(event.target.value)}
                  value={comments}
                  fullWidth
                  name="comments"
                  multiline
                />
              </Grid> 
            </Grid>
          </>
        )}
      </Box>
      <Box display="flex" justifyContent="flex-end" width="100%">
        <Button variant="contained" disabled={isLoading} onClick={handleSave}>
          Save
          {isLoading && <CircularProgress size="small" />}
        </Button>
      </Box>
    </Box>
  );
};

export default ResultEntered;
