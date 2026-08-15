import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  tableCellClasses,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArchiveOutlined,
  BlockOutlined,
  EditOutlined,
  KeyOutlined,
  LockOpenOutlined,
  LockResetOutlined,
  RestoreOutlined,
} from "@mui/icons-material";
import styled from "@emotion/styled";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: "white",
    fontWeight: 800,
  },
}));

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const getCredentialState = (record) => {
  if (!record?.authUid) {
    return {
      label: "Login Pending",
      color: "warning",
      variant: "outlined",
      hasLogin: false,
      loginEnabled: false,
    };
  }

  if (record?.loginAccess === false || record?.credentialsStatus === "disabled") {
    return {
      label: "Login Disabled",
      color: "default",
      variant: "outlined",
      hasLogin: true,
      loginEnabled: false,
    };
  }

  return {
    label: "Login Enabled",
    color: "success",
    variant: "filled",
    hasLogin: true,
    loginEnabled: true,
  };
};

const ThirdpartyTable = ({
  thirdParties,
  kind = "hospital",
  onEdit,
  onArchive,
  onRestore,
  onCreateLogin,
  onResetPassword,
  onToggleLogin,
}) => {
  const theme = useTheme();
  const isHospital = kind === "hospital";

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <Table sx={{ minWidth: 780 }} aria-label={`${kind} table`}>
        <TableHead>
          <TableRow sx={{ background: theme.palette.primary.main }}>
            <StyledTableCell>Name</StyledTableCell>
            {isHospital ? <StyledTableCell>Address</StyledTableCell> : null}
            <StyledTableCell>Email</StyledTableCell>
            <StyledTableCell>Phone</StyledTableCell>
            {isHospital ? <StyledTableCell>Team Members</StyledTableCell> : null}
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Login</StyledTableCell>
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {thirdParties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isHospital ? 8 : 6}>
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No records found.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            thirdParties.map((thirdParty) => {
              const active = isActiveRecord(thirdParty);
              const credentialState = getCredentialState(thirdParty);

              return (
                <TableRow
                  key={thirdParty.id}
                  hover
                  sx={{
                    opacity: active ? 1 : 0.68,
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>
                      {thirdParty?.name || "-"}
                    </Typography>
                  </TableCell>
                  {isHospital ? <TableCell>{thirdParty?.address || "-"}</TableCell> : null}
                  <TableCell>{thirdParty?.email || "-"}</TableCell>
                  <TableCell>{thirdParty?.phone || "-"}</TableCell>
                  {isHospital ? (
                    <TableCell>
                      {Array.isArray(thirdParty?.teamMembers) && thirdParty.teamMembers.length > 0
                        ? thirdParty.teamMembers.join(", ")
                        : "-"}
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Chip
                      size="small"
                      label={active ? "Active" : "Archived"}
                      color={active ? "success" : "default"}
                      variant={active ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Chip
                        size="small"
                        label={credentialState.label}
                        color={credentialState.color}
                        variant={credentialState.variant}
                      />
                      {thirdParty?.createdFrom === "booking" && !credentialState.hasLogin ? (
                        <Typography variant="caption" color="text.secondary">
                          Added from booking
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {active && !credentialState.hasLogin ? (
                        <Tooltip title="Create login">
                          <IconButton size="small" onClick={() => onCreateLogin?.(thirdParty)}>
                            <KeyOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {active && credentialState.hasLogin ? (
                        <Tooltip title="Reset password">
                          <IconButton size="small" onClick={() => onResetPassword?.(thirdParty)}>
                            <LockResetOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {active && credentialState.hasLogin ? (
                        <Tooltip title={credentialState.loginEnabled ? "Disable login" : "Enable login"}>
                          <IconButton
                            size="small"
                            onClick={() => onToggleLogin?.(thirdParty, !credentialState.loginEnabled)}
                          >
                            {credentialState.loginEnabled ? (
                              <BlockOutlined fontSize="small" />
                            ) : (
                              <LockOpenOutlined fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit?.(thirdParty)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {active ? (
                        <Tooltip title="Archive">
                          <IconButton size="small" onClick={() => onArchive?.(thirdParty)}>
                            <ArchiveOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Restore">
                          <IconButton size="small" onClick={() => onRestore?.(thirdParty)}>
                            <RestoreOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ThirdpartyTable;
