import React, { useState, useEffect } from "react";
import { Step, Stepper, StepLabel, CircularProgress } from "@mui/material";


const BookingStepper = ({ booking }) => {
  const [activeStep, setActiveStep] = useState(0); // Initial step (Received)

const steps = [
  "Received",
  "Grossed",
  "Slide Delivered",
  "Result Entered",
  "Authorized",
];

const shouldDisplayStep = (step, userRole) => {
  // Default to hiding for safety
  let visible = false;

  switch (userRole) {
    case "admin":
      // Admins can see all steps
      visible = true;
      break;
    case "receptionist":
      // Receptionists can only see Received
      visible = step === 0;
      break;
    case "technician":
      // Technicians can see all steps except those requiring data entry
      visible = step !== 0 && step !== 1 && step !== 2;
      break;
    case "thirdparty":
      // Third-party can only see their own bookings
      // Need additional logic to check if booking belongs to user
      visible = false; // Implement your logic here
      break;
    default:
      // Handle other user roles or unexpected cases
      console.warn("Unhandled user role:", userRole);
      break;
  }

  // Additional logic based on booking state can be added here if needed

  return visible;
};

const renderStepLabel = (step, userRole) => {
  if (shouldDisplayStep(step, userRole)) {
    return <StepLabel>{steps[step]}</StepLabel>;
  }
  return null;
};

  useEffect(() => {
    const stateToStep = {
      Received: 0,
      Grossed: 1,
      "Slide Delivered": 2,
      "Result Entered": 3,
      Authorized: 4,
    };
    setActiveStep(stateToStep[booking.state]);
  }, [booking]);
  // ... rest of the component

  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((step, index) => (
        <Step key={step} disabled={!shouldDisplayStep(step, userRole)}>
          {renderStepLabel(step, userRole)}
        </Step>
      ))}
    </Stepper>
  );
};