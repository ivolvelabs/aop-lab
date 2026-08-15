import React, { useCallback, useState } from "react";
import { db } from "../firebase";
import CardComponent from "../Components/CardComponent";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import dayjs from "dayjs";
import { Alert, Box, Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import TodayIcon from "@mui/icons-material/Today";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import { NavLink } from "react-router-dom";

const HomePage = () => {
  const [counts, setCounts] = useState({
    pending: null,
    completed: null,
    today: null,
  });
  const [error, setError] = useState("");

  const getDashboardCounts = useCallback(async () => {
    try {
      setError("");
      const coll = collection(db, "bookings");
      const todayLabel = dayjs().format("DD-MM-YYYY");

      const [pendingSnapshot, completedSnapshot, todaySnapshot] =
        await Promise.all([
          getCountFromServer(query(coll, where("isCompleted", "==", false))),
          getCountFromServer(query(coll, where("isCompleted", "==", true))),
          getCountFromServer(query(coll, where("bookingDate", "==", todayLabel))),
        ]);

      setCounts({
        pending: pendingSnapshot.data().count,
        completed: completedSnapshot.data().count,
        today: todaySnapshot.data().count,
      });
    } catch (fetchError) {
      console.error("Failed to load dashboard counts:", fetchError);
      setError("Dashboard data could not be loaded. Please retry shortly.");
    }
  }, []);

  useEffect(() => {
    getDashboardCounts();
  }, [getDashboardCounts]);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2.5,
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(236,248,255,0.78))",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
              Lab Command Center
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 760 }}>
              Daily booking volume, pending reports, and case workflow access for {dayjs().format("DD MMM YYYY")}.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              component={NavLink}
              to="/bookings"
              variant="contained"
              startIcon={<AddCircleOutlineRoundedIcon />}
            >
              New Booking
            </Button>
            <Button
              component={NavLink}
              to="/templates"
              variant="outlined"
              startIcon={<AssignmentTurnedInRoundedIcon />}
            >
              Templates
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch" }}
      >
        <CardComponent
          cardType="Pending Bookings"
          value={counts.pending}
          section="Bookings"
          sectionPath="/bookings"
          caption="Cases currently in active workflow states."
          icon={<PendingActionsIcon sx={{ color: "warning.main" }} />}
          colorKey="warning"
        />
        <CardComponent
          cardType="Completed Reports"
          value={counts.completed}
          section="Bookings"
          sectionPath="/bookings"
          caption="Reports already finalized and marked completed."
          icon={<FactCheckIcon sx={{ color: "success.main" }} />}
          colorKey="success"
        />
        <CardComponent
          cardType="Today's Registrations"
          value={counts.today}
          section="Bookings"
          sectionPath="/bookings"
          caption="Bookings created with today as booking date."
          icon={<TodayIcon sx={{ color: "info.main" }} />}
          colorKey="info"
        />
      </Stack>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>
              Case Workflow
            </Typography>
            <Stack divider={<Divider flexItem />} spacing={0.75}>
              {[
                ["Received", "Case created and specimen details captured"],
                ["Grossed", "Gross description and block details"],
                ["Slide Delivered", "Slide dispatch and handoff tracking"],
                ["Result Entered", "Diagnosis and microscopic details"],
                ["Result Authorized", "Final review, print, and completion"],
              ].map(([title, caption], index) => (
                <Stack key={title} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: index === 0 ? "primary.main" : "rgba(0, 87, 184, 0.08)",
                      color: index === 0 ? "white" : "primary.main",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {caption}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>
              Quick Actions
            </Typography>
            <Stack spacing={1.25}>
              <Button component={NavLink} to="/bookings" variant="outlined" startIcon={<ManageSearchRoundedIcon />} sx={{ justifyContent: "flex-start" }}>
                Search active and completed bookings
              </Button>
              <Button component={NavLink} to="/masters" variant="outlined" sx={{ justifyContent: "flex-start" }}>
                Manage test categories and specimens
              </Button>
              <Button component={NavLink} to="/thirdparty" variant="outlined" sx={{ justifyContent: "flex-start" }}>
                Manage doctors, hospitals, and clinics
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
