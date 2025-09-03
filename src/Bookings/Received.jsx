import React, { useEffect, useState } from "react";
import { Grid, Typography, List, ListItem, ListItemText } from "@mui/material";

const Received = ({ bookingData }) => {
  // console.log(bookingData + "--------------");
  // console.log(bookingData + "--------------");

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
  setIsLoading(true);
  if (bookingData.id) {
    setIsLoading(false);
  }  
  }, [])
  

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Received Information</Typography>
      </Grid>
      <Grid item xs={6}>
        <List>
          <ListItem>
            <ListItemText
              primary="Patient Name:"
              secondary={bookingData?.patientName}
            />
            {bookingData?.PatientName}
          </ListItem>
          <ListItem>
            <ListItemText primary="Age:" secondary={bookingData?.age} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Sex:" secondary={bookingData?.sex} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Referring Doctor:"
              secondary={bookingData?.referralDoctor?.name}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Phone:" secondary={bookingData?.phone} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Hospital:"
              secondary={bookingData?.hospital?.name}
            />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={6}>
        <List>
          <ListItem>
            <ListItemText
              primary="Date:"
              secondary={
                bookingData?.bookingDate &&
                bookingData.bookingDate.toDate().toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Clinical Diagnosis:"
              secondary={bookingData?.clinicalDiagnosis}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Clinical History:"
              secondary={bookingData?.clinicalHistory}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Specimen Type:"
              secondary={bookingData?.specimenType}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Status:" secondary={bookingData?.status} />
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
};

export default Received;
