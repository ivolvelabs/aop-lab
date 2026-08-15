import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your Firestore instance is imported here
import { Delete } from "@mui/icons-material";
import { useAuth } from "../Contexts/AuthContext";
import { buildWorkflowEvent } from "../utils/workflowAudit";

const initialSlideDeliveredDetails = {
  afb: {
    stainName: "",
    cassetteName: "",
  },
  he: { stainName: "", cassetteName: "" },
  pas: { stainName: "", cassetteName: "" },
  gms: { stainName: "", cassetteName: "" },
  congoRed: { stainName: "", cassetteName: "" },
  ihc: { stainName: "", cassetteName: "" },
};

const SlideDelivered = ({
  bookingData,
  statesInfo,
  handleUpdateStatesInfo,
}) => {
  const { user } = useAuth();
  const [newItems, setNewItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [others, setOthers] = useState([]);

  const [slideDeliveredDetails, setSlideDeliveredDetails] = useState(
    bookingData?.slideDeliveredDetails || initialSlideDeliveredDetails
  );
 

  useEffect(() => {
    const ot = [];
    const details =
      bookingData?.slideDeliveredDetails || initialSlideDeliveredDetails;

    setIsLoading(true);
    setSlideDeliveredDetails(details);
    Object.entries(details).forEach((i) => {
      if (
        i[0].includes("afb") ||
        i[0].includes("congoRed") ||
        i[0].includes("gms") ||
        i[0].includes("he") ||
        i[0].includes("ihc") ||
        i[0].includes("pas")
      ) {
        return;
      }
      ot.push(i);
    });
    setOthers(ot);
    setIsLoading(false);
  }, [bookingData]);

  const handleTextFieldChange = (event, stain) => {
    const { name, value } = event.target;

    const updatedDetails = { ...slideDeliveredDetails };

    if (stain) {
      updatedDetails[stain] = {
        ...updatedDetails[stain],
        [name]: value,
        label: name.endsWith("Cassette")
          ? [
              name.slice(0, name.indexOf("Cassette")).toUpperCase(),
              " ",
              name.slice(name.indexOf("Cassette")),
            ].join("")
          : null,
      };
    } else {
          setSlideDeliveredDetails({
            ...slideDeliveredDetails,
            [name]: value,
          });
        }

    setSlideDeliveredDetails(updatedDetails);
  };

  const handleAddNewItem = () => {
    setNewItems([
      ...newItems,
      { slideName: "", slideNumber: "", slideCassette: "", slidelabel: "" },
    ]);
  };

  const handleRemoveNewItem = (index) => {
    setNewItems(newItems.filter((item, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const bookingRef = doc(db, "bookings", bookingData.id);

    try {
      const updates = {
        slideDeliveredDetails: {
          ...slideDeliveredDetails,
          ...newItems.reduce(
            (acc, item) => ({
              ...acc,
              [item.slideName]: item.slideNumber,
              [item.slideName + " Cassette"]: item.slideCassette,
            }),
            {}
          ),
        },
      };

      if (statesInfo) {
        updates.statesInfo = await statesInfo.map((state) => {
          if (state.state === "slideDelivered") {
            return {
              ...state,
              isDone: true,
              updatedAt: new Date(),
            };
          }
          return state;
        });
        handleUpdateStatesInfo(updates.statesInfo);
      }
      updates.workflowHistory = arrayUnion(
        buildWorkflowEvent({
          step: "slideDelivered",
          action: "Slide delivery details saved",
          user,
        })
      );

      await updateDoc(bookingRef, updates);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {" "}
      <Box display="flex" flexDirection="column" width="100%">
        <Typography variant="h4">Slide Delivered Information</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            sx={{ flexDirection: "column" }}
          >
            {" "}
            <TextField
              label="H&E"
              name="he"
              placeholder="H&E"
              value={slideDeliveredDetails.he?.he || ""}
              // onChange={handleTextFieldChange}
              onChange={(event) => handleTextFieldChange(event, "he")}
            />
            <div>Special Stains</div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TextField
                label="AFB"
                name="afb"
                value={slideDeliveredDetails?.afb?.afb || ""}
                onChange={(event) => handleTextFieldChange(event, "afb")}
                //
              />
              <TextField
                label="AFB Cassette"
                name="afbCassette"
                value={slideDeliveredDetails?.afb?.afbCassette || ""}
                onChange={(event) => handleTextFieldChange(event, "afb")}
                //
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TextField
                label="PAS"
                name="pas"
                value={slideDeliveredDetails?.pas?.pas || ""}
                onChange={(event) => handleTextFieldChange(event, "pas")}
              />
              <TextField
                label="PAS Cassette"
                name="pasCassette"
                value={slideDeliveredDetails?.pas?.pasCassette || ""}
                onChange={(event) => handleTextFieldChange(event, "pas")}
                //
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TextField
                label="GMS"
                name="gms"
                value={slideDeliveredDetails?.gms?.gms || ""}
                onChange={(event) => handleTextFieldChange(event, "gms")}
              />
              <TextField
                label="GMS Cassette"
                name="gmsCassette"
                value={slideDeliveredDetails?.gms?.gmsCassette || ""}
                onChange={(event) => handleTextFieldChange(event, "gms")}
                //
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TextField
                label="Congo Red"
                name="congoRed"
                value={slideDeliveredDetails?.congoRed?.congoRed || ""}
                onChange={(event) => handleTextFieldChange(event, "congoRed")}
              />
              <TextField
                label="Congo Red Cassette"
                name="congoRedCassette"
                value={slideDeliveredDetails?.congoRed?.congoRedCassette || ""}
                onChange={(event) => handleTextFieldChange(event, "congoRed")}
                //
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TextField
                label="IHC"
                name="ihc"
                value={slideDeliveredDetails?.ihc?.ihc || ""}
                onChange={(event) => handleTextFieldChange(event, "ihc")}
              />
              <TextField
                label="IHC Cassette"
                name="ihcCassette"
                value={slideDeliveredDetails?.ihc?.ihcCassette || ""}
                onChange={(event) => handleTextFieldChange(event, "ihc")}
                //
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* <Typography variant="h6">Other Slides Information</Typography> */}
              <div>Other Stains</div>
              {others.length > 0
                ? others.map((a) => {
                    return (
                      <TextField
                        key={a[0]}
                        style={{ margin: "10px 20px" }}
                        label={a[0]}
                        name={a[0]}
                        value={a[1] || ""}
                        onChange={handleTextFieldChange}
                        //
                      />
                    );
                  })
                : null}
            </div>
          </Box>
        )}
      </Box>
      {newItems.map((item, index) => (
        <Box display="flex" key={index} width="100%">
          <TextField
            label="Stain Name"
            value={item.slideName}
            onChange={(event) =>
              setNewItems(
                newItems.map((i) =>
                  i === item ? { ...i, slideName: event.target.value } : i
                )
              )
            }
          />
          <TextField
            label="Number of slides "
            value={item.slideNumber}
            onChange={(event) =>
              setNewItems(
                newItems.map((i) =>
                  i === item ? { ...i, slideNumber: event.target.value } : i
                )
              )
            }
          />
          <TextField
            label="Cassette"
            name="cassette"
            value={item.slideCassette}
            // onChange={handleTextFieldChange}
            onChange={(event) =>
              setNewItems(
                newItems.map((i) =>
                  i === item ? { ...i, slideCassette: event.target.value } : i
                )
              )
            }
          />
          <IconButton onClick={() => handleRemoveNewItem(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end" width="100%" gap={2}>
        <Button variant="contained" size="small" onClick={handleAddNewItem}>
          Add New Item
        </Button>
        <Button
          variant="contained"
          disabled={
            isLoading || slideDeliveredDetails?.he?.he === undefined
          }
          onClick={handleSave}
        >
          Save
          {isLoading && <CircularProgress size="small" />}
        </Button>
      </Box>
    </Box>
  );
};

export default SlideDelivered;
