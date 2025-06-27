import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate, NavLink } from "react-router-dom";
import { useTheme } from "@emotion/react";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { CircularProgress } from "@mui/material";


export default function CardComponent({ cardType, pendingCount, section, sectionPath}) {
const navigate = useNavigate();
const theme = useTheme();


  return (
    <Card
      sx={{
        minWidth: "45%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px",
      }}
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 28 }} gutterBottom>
          {cardType}
        </Typography>
        <Typography
          sx={{ color: theme.palette.primary.main }}
          variant="h1"
          component="div"
        >
          {pendingCount ? pendingCount : <CircularProgress size={44} />}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          size="large"
          endIcon={<KeyboardDoubleArrowRightIcon />}
        >
          <NavLink to={sectionPath}>Go to {section}</NavLink>
        </Button>
      </CardActions>
    </Card>
  );
}
