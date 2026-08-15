import React, { useState, useEffect, useRef } from "react";
import {
  Stepper,
  Step,
  StepButton,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import Received from "./Received";
import Grossed from "./Grossed";
import SlideDelivered from "./SlideDelivered";
import ResultEntered from "./ResultEntered";
import ResultAuthorised from "./ResultAuthorised";
import { toDateValue } from "../utils/dateFormat";

const formatHistoryDate = (value) => {
  const date = toDateValue(value);
  if (!date) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

const SingleBooking = () => {
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [statesInfo, setStatesInfo] = useState([]);
  const { bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const hasInitializedStep = useRef(false);

useEffect(() => {
  const db = getFirestore();
  const bookingRef = doc(db, "bookings", bookingId);
  const unsubscribe = onSnapshot(
    bookingRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const nextStatesInfo = data.statesInfo || [];
        setBookingData({ ...data, id: docSnap.id });
        setStatesInfo(nextStatesInfo);
        const firstPendingStep = nextStatesInfo.findIndex((s) => !s.isDone);
        const defaultStep =
          firstPendingStep === -1
            ? Math.max(nextStatesInfo.length - 1, 0)
            : firstPendingStep;

        if (!hasInitializedStep.current) {
          setActiveStep(defaultStep);
          hasInitializedStep.current = true;
        } else {
          setActiveStep((prevStep) =>
            Math.min(prevStep, Math.max(nextStatesInfo.length - 1, 0))
          );
        }
      } else {
        console.error("Booking not found:", bookingId);
      }
      setIsLoading(false);
    },
    (error) => {
      console.error("Error fetching booking:", error);
      setIsLoading(false);
    }
  );

  return unsubscribe;
}, [bookingId]);


const handleNext = () => {
  if (statesInfo[activeStep]?.isDone) {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, statesInfo.length - 1)
    );
  }
};

const handleBack = () => {
  setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
};

const handleStepClick = (index) => {
  const firstPendingStep = statesInfo.findIndex((step) => !step.isDone);
  const maxOpenStep =
    firstPendingStep === -1 ? statesInfo.length - 1 : firstPendingStep;

  if (index <= maxOpenStep || statesInfo[index]?.isDone) {
    setActiveStep(index);
  }
};

const handleUpdateStatesInfo = (updatedStatesInfo) => {
  const wasCurrentStepDone = statesInfo[activeStep]?.isDone;
  const isCurrentStepDoneNow = updatedStatesInfo[activeStep]?.isDone;
  setStatesInfo(updatedStatesInfo); // Update statesInfo from child
  if (!wasCurrentStepDone && isCurrentStepDoneNow) {
    setSaveNoticeOpen(true);
  }
};

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stepper component for step visualization */}
          <Stepper activeStep={activeStep} alternativeLabel nonLinear>
            {statesInfo.map((step, index) => (
              <Step key={step.state} completed={Boolean(step.isDone)}>
                <StepButton color="inherit" onClick={() => handleStepClick(index)}>
                  {step.stateName}
                </StepButton>
              </Step>
            ))}
          </Stepper>

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
                  {bookingData.serialNumber || "Booking"} workflow
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open any completed step to review or update it. Saved updates are tracked below.
                </Typography>
              </Box>
              <Chip
                label={bookingData.isCompleted ? "Completed" : "In workflow"}
                color={bookingData.isCompleted ? "success" : "warning"}
                variant={bookingData.isCompleted ? "filled" : "outlined"}
              />
            </Stack>
            {Array.isArray(bookingData.workflowHistory) &&
            bookingData.workflowHistory.length > 0 ? (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.75}>
                  {bookingData.workflowHistory
                    .slice()
                    .sort(
                      (a, b) =>
                        (toDateValue(b.at)?.getTime() || 0) -
                        (toDateValue(a.at)?.getTime() || 0)
                    )
                    .slice(0, 6)
                    .map((event, index) => (
                      <Stack
                        key={`${event.step || "event"}-${index}`}
                        direction={{ xs: "column", md: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "center" }}
                      >
                        <Chip size="small" label={event.step || "workflow"} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {event.action || "Updated"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatHistoryDate(event.at)} by {event.byName || "Unknown user"}
                        </Typography>
                      </Stack>
                    ))}
                </Stack>
              </>
            ) : null}
          </Paper>

          {/* Content area for displaying the current step's component */}
          <Box sx={{ flex: 1, overflowY: "auto", pt: 2 }}>
            {activeStep === 0 ? (
              <Received handleUpdateStatesInfo={handleUpdateStatesInfo} bookingData={bookingData} statesInfo={statesInfo} />
            ) : activeStep === 1 ? (
              <Grossed handleUpdateStatesInfo={handleUpdateStatesInfo} bookingData={bookingData} statesInfo={statesInfo}/>
            ) : activeStep === 2 ? (
              <SlideDelivered handleUpdateStatesInfo={handleUpdateStatesInfo} bookingData={bookingData} statesInfo={statesInfo} />
            ) : activeStep === 3 ? (
              <ResultEntered handleUpdateStatesInfo={handleUpdateStatesInfo} bookingData={bookingData} statesInfo={statesInfo} />
            ) : (
              <ResultAuthorised handleUpdateStatesInfo={handleUpdateStatesInfo} id={bookingData.id} bookingData={bookingData} statesInfo={statesInfo} />
            )}
          </Box>

          {/* Button group for navigation and saving */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button
              variant="contained"
              disabled={activeStep === 0 || !statesInfo[0]?.isDone}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Button
              disabled={!statesInfo[activeStep]?.isDone}
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === statesInfo.length - 1 ? "Done" : "Next"}
            </Button>
          </Box>
          <Snackbar
            open={saveNoticeOpen}
            autoHideDuration={2200}
            onClose={() => setSaveNoticeOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSaveNoticeOpen(false)}
              severity="success"
              sx={{ width: "100%" }}
            >
              Data saved. Click Next to continue.
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default SingleBooking;
