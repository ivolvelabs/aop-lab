import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box, CircularProgress, Stack } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function CardComponent({
  cardType,
  value,
  pendingCount,
  section,
  sectionPath,
  caption,
  icon,
  colorKey = "primary",
}) {
  const theme = useTheme();
  const displayValue = value ?? pendingCount;
  const accentColor = theme.palette[colorKey]?.main || theme.palette.primary.main;

  return (
    <Card
      sx={{
        minWidth: { xs: "100%", md: 0 },
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 0,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderTop: `4px solid ${accentColor}`,
          pointerEvents: "none",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.secondary" }}>
            {cardType}
          </Typography>
            <Typography
              sx={{ color: accentColor, fontWeight: 900, lineHeight: 1.05, mt: 1 }}
              variant="h3"
              component="div"
            >
              {displayValue === null || displayValue === undefined ? (
                <CircularProgress size={34} />
              ) : (
                displayValue
              )}
            </Typography>
          </Box>
          {icon ? (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                bgcolor: `${accentColor}14`,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>
        <Typography sx={{ color: "text.secondary", mt: 1.5, minHeight: 42 }} variant="body2">
          {caption || "Live snapshot from current booking records."}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            component={NavLink}
            to={sectionPath}
            sx={{ px: 0, color: accentColor, fontWeight: 800 }}
          >
            Open {section}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
