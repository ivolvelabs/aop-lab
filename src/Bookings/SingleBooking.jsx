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
import { collection, doc, getDoc, getFirestore, onSnapshot, query, updateDoc } from "firebase/firestore";
import Received from "./Received";
import Grossed from "./Grossed";
import SlideDelivered from "./SlideDelivered";
import ResultEntered from "./ResultEntered";
import ResultAuthorised from "./ResultAuthorised";

const SingleBooking = () => {
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [statesInfo, setStatesInfo] = useState([]);
  const { bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(true);


  const navigate = useNavigate();


useEffect(() => {
  const db = getFirestore();
  // const docRef = doc(db, "bookings", bookingId);
  const getBookingById = async (bookingId) => {
    const bookingRef = doc(db, "bookings", bookingId);

  const unsubscribe = await onSnapshot(bookingRef, (docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      setBookingData(data);
      setStatesInfo(data.statesInfo);
      const initialActiveStep = data.statesInfo.findIndex((s) => !s.isDone);
      setActiveStep(initialActiveStep);
    } else {
      console.error("Booking not found:", bookingId);
    }
    setIsLoading(false); // Update loading state after receiving data
  }, (error) => {
    console.error("Error fetching booking:", error);
    setIsLoading(false); // Update loading state on error
  });

  // Remember to unsubscribe from the listener when the component unmounts
  // to avoid memory leaks
  return unsubscribe;
};
  // };
  // const getBookingById = async (bookingId) => {
  //   try {
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists) {
  //       const data = docSnap.data();
  //       data.id = bookingId;
  //       setBookingData(data);
  //       setStatesInfo(data.statesInfo);
  //       const initialActiveStep = data.statesInfo.findIndex((s) => !s.isDone);
  //       setActiveStep(initialActiveStep);
  //     } else {
  //       console.error("Booking not found:", bookingId);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching booking:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  getBookingById(bookingId);
}, [bookingId]);


const handleNext = () => {
  if (statesInfo[activeStep].isDone) {
    setActiveStep((prevActiveStep) => prevActiveStep + 1); // Use functional state update
  }
};

const handleBack = () => {
  setActiveStep((prevActiveStep) => prevActiveStep - 1); // Use functional state update
};

const handleUpdateStatesInfo = (updatedStatesInfo) => {
  setStatesInfo(updatedStatesInfo); // Update statesInfo from child
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
          <Stepper activeStep={activeStep} alternativeLabel>
            {statesInfo.map((step, index) => (
              <Step key={step.state}>
                <StepLabel>{step.stateName}</StepLabel>
                <StepIcon />
              </Step>
            ))}
          </Stepper>

          {/* Content area for displaying the current step's component */}
          <Box sx={{ flex: 1, overflowY: "auto", pt: 2 }}>
            {activeStep === 0 ? (
              <Received handleUpdateStatesInfo={handleUpdateStatesInfo} bookingData={bookingData} />
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
              disabled={activeStep === 0 || !statesInfo[0].isDone}
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
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SingleBooking;