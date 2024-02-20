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
        const initialActiveStep = data.statesInfo.findIndex((s) => !s.isDone);
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

  const handleSaveStep = async (stepIndex) => {
    // Implement logic to update state in Firebase (e.g., using Firestore)
    setIsLoading(true);

    try {
      const updatedStatesInfo = [...statesInfo];
      updatedStatesInfo[stepIndex].isDone = true;

      const bookingRef = doc(getFirestore(), "bookings", bookingId);
      await updateDoc(bookingRef, { statesInfo: updatedStatesInfo });

      setStatesInfo(updatedStatesInfo);
    } catch (error) {
      console.error("Error saving step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (statesInfo[activeStep].isDone) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (statesInfo[activeStep - 1].isDone) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {statesInfo.map((step, index) => (
              <Step key={step.state}>
                <StepLabel>{step.stateName}</StepLabel>
                <StepIcon />
              </Step>
            ))}
          </Stepper>

          <div>
            {activeStep === 0 ? (
              <Received bookingData={bookingData} />
            ) : activeStep === 1 ? (
              <Grossed bookingData={bookingData} />
            ) : activeStep === 2 ? (
              <SlideDelivered bookingData={bookingData} />
            ) : activeStep === 3 ? (
              <ResultEntered bookingData={bookingData} />
            ) : (
              <ResultAuthorised bookingData={bookingData} />
            )}
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0 || !statesInfo[0].isDone} // Disable back button if first step or previous step not completed
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button
                onClick={handleNext}
                disabled={activeStep === 4 || !statesInfo[activeStep].isDone} // Disable next button if last step or current step not completed
              >
                Next
              </Button>
            </Box>
          </div>
        </Box>
      )}
    </Box>
  );
};

export default SingleBooking;
