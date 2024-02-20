import React, { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  StepIcon,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import Received from "./Received";
import Grossed from "./Grossed";
import SlideDelivered from "./SlideDelivered";
import ResultEntered from "./ResultEntered";
import ResultAuthorised from "./ResultAuthorised";

const SingleBooking = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [statesInfo, setStatesInfo] = useState([]);
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const getBookingById = async (bookingId) => {
    const db = getFirestore();
    const docRef = doc(db, "bookings", bookingId);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        const data = docSnap.data();
        setBookingData(data);
        setStatesInfo(data.statesInfo);

        console.log(data.statesInfo.findIndex((s) => !s.isDone));
        // Calculate the initial activeStep based on completed states
        const initialActiveStep = data.statesInfo.findIndex((s) => !s.isDone);

        console.log(initialActiveStep);
        setActiveStep(initialActiveStep);
      } else {
        console.error("Booking not found:", bookingId);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBookingById(bookingId);
  }, [bookingId]);

  const isStepAllowed = (stepState) => {
    const stepIndex = statesInfo.findIndex((s) => s.state === stepState);
    return stepIndex === 0 || statesInfo[stepIndex - 1]?.isDone;
  };

  const handleSaveStep = async (stepIndex) => {
    // Implement logic to update state in Firebase (e.g., using Firestore)
    setIsLoading(true);

    try {
      const updatedStatesInfo = [...statesInfo];
      updatedStatesInfo[stepIndex].isDone = true;

      const bookingRef = doc(getFirestore(), "bookings", bookingId);
      await updateDoc(bookingRef, { statesInfo: updatedStatesInfo });

      setStatesInfo(updatedStatesInfo);

      // Update activeStep if necessary
      if (
        stepIndex < statesInfo.length - 1 &&
        !statesInfo[stepIndex + 1].isDone
      ) {
        setActiveStep(stepIndex + 1);
      }
    } catch (error) {
      console.error("Error saving step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Stepper activeStep={activeStep} alternativeLabel>
            {statesInfo.map((step, index) => (
              <Step key={step.state} disabled={!isStepAllowed(step.state)}>
                <StepLabel>{step.stateName}</StepLabel>
                <StepIcon
                  sx={{
                    "&.Mui-completed": { color: "green" }, // Adjust as needed
                    "&.Mui-active": { color: "blue" }, // Adjust as needed
                    "&": { color: "black" }, // Set default color for all states
                  }}
                />
                <Box key={step.state} sx={{ mt: 2 }}>
                  {index === 0 && <Received bookingData={bookingData} />}
                  {index === 1 && <Grossed bookingData={bookingData} />}
                  {index === 2 && <SlideDelivered bookingData={bookingData} />}
                  {index === 3 && <ResultEntered bookingData={bookingData} />}
                  {index === 4 && (
                    <ResultAuthorised bookingData={bookingData} />
                  )}
                  <Button
                    variant="contained"
                    disabled={!isStepAllowed(index)}
                    onClick={() => handleSaveStep(index)}
                  >
                    Save Step {index + 1}
                  </Button>
                </Box>
              </Step>
            ))}
          </Stepper>
          {/* ... Step content and buttons (continued in next response) */}
          {/* {statesInfo.map((step, index) => (
            <Box key={step.state} sx={{ mt: 2 }}>
              {index === 0 && <Received bookingData={bookingData} />}
              {index === 1 && <Grossed bookingData={bookingData} />}
              {index === 2 && <SlideDelivered bookingData={bookingData} />}
              {index === 3 && <ResultEntered bookingData={bookingData} />}
              {index === 4 && <ResultAuthorised bookingData={bookingData} />}
              <Button
                variant="contained"
                disabled={!isStepAllowed(index)}
                onClick={() => handleSaveStep(index)}
              >
                Save Step {index + 1}
              </Button>
            </Box>
          ))} */}
        </>
      )}
    </Box>
  );
};

export default SingleBooking;
