import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArchiveOutlined,
  EditOutlined,
  RestoreOutlined,
  Search,
} from "@mui/icons-material";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import JoditEditor from "jodit-react";
import { useTheme } from "@mui/material/styles";
import { db } from "../firebase";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const emptyForm = {
  name: "",
  description: "",
};

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalize = (value) => String(value || "").toLowerCase().trim();

const TemplateCrudPage = ({
  collectionName,
  title,
  addLabel = "Add Template",
  descriptionLabel = "Description",
  richText = false,
  multiline = false,
}) => {
  const theme = useTheme();
  const editor = useRef(null);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const editorConfig = useMemo(() => ({ readonly: false }), []);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTemplates(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const filteredTemplates = useMemo(() => {
    const term = normalize(searchTerm);

    return templates.filter((template) => {
      const active = isActiveRecord(template);
      if (!showArchived && !active) return false;
      if (!term) return true;

      return [template.name, template.description]
        .map(normalize)
        .some((value) => value.includes(term));
    });
  }, [searchTerm, showArchived, templates]);

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (template) => {
    setSelectedTemplate(template);
    setForm({
      name: template?.name || "",
      description: template?.description || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
    setForm(emptyForm);
  };

  const saveTemplate = async () => {
    try {
      setSaving(true);

      if (selectedTemplate) {
        await updateDoc(doc(db, collectionName, selectedTemplate.id), {
          name: form.name.trim(),
          description: form.description,
          updatedAt: serverTimestamp(),
        });
        setFeedback({ severity: "success", message: "Template updated." });
      } else {
        await addDoc(collection(db, collectionName), {
          name: form.name.trim(),
          description: form.description,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setFeedback({ severity: "success", message: "Template created." });
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving template:", error);
      setFeedback({ severity: "error", message: "Template could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const archiveTemplate = async (template) => {
    try {
      await updateDoc(doc(db, collectionName, template.id), {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Template archived." });
    } catch (error) {
      console.error("Error archiving template:", error);
      setFeedback({ severity: "error", message: "Template could not be archived." });
    }
  };

  const restoreTemplate = async (template) => {
    try {
      await updateDoc(doc(db, collectionName, template.id), {
        active: true,
        archivedAt: null,
        updatedAt: serverTimestamp(),
      });
      setFeedback({ severity: "success", message: "Template restored." });
    } catch (error) {
      console.error("Error restoring template:", error);
      setFeedback({ severity: "error", message: "Template could not be restored." });
    }
  };

  const canSave = form.name.trim() !== "" && form.description.trim() !== "";

  return (
    <div style={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ my: 2 }}
      >
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          type="search"
          label={`Search ${title.toLowerCase()}`}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />
          }
          label="Show archived"
          sx={{ whiteSpace: "nowrap" }}
        />
        <Button variant="contained" disabled={loading} onClick={openCreateDialog}>
          {loading ? <CircularProgress size={24} color="inherit" /> : addLabel}
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress size={54} />
      ) : filteredTemplates.length > 0 ? (
        <Grid container spacing={2}>
          {filteredTemplates.map((template) => {
            const active = isActiveRecord(template);

            return (
              <Grid item xs={12} key={template.id}>
                <Card sx={{ borderLeft: `${theme.palette.primary.main} 5px solid`, opacity: active ? 1 : 0.68 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography
                        sx={{ color: theme.palette.primary.main, overflowWrap: "break-word" }}
                        variant="h6"
                      >
                        {template.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={active ? "Active" : "Archived"}
                        color={active ? "success" : "default"}
                        variant={active ? "filled" : "outlined"}
                      />
                    </Stack>
                    {richText ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(template.description),
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEditDialog(template)}>
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                    {active ? (
                      <Tooltip title="Archive">
                        <IconButton onClick={() => archiveTemplate(template)}>
                          <ArchiveOutlined />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Restore">
                        <IconButton onClick={() => restoreTemplate(template)}>
                          <RestoreOutlined />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <p>No templates found.</p>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{selectedTemplate ? `Edit ${title}` : addLabel}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            required
            label="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            fullWidth
          />
          {richText ? (
            <JoditEditor
              ref={editor}
              value={form.description}
              config={editorConfig}
              tabIndex={1}
              onChange={(newContent) =>
                setForm((current) => ({ ...current, description: newContent }))
              }
            />
          ) : (
            <TextField
              required
              label={descriptionLabel}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              fullWidth
              multiline={multiline}
              rows={multiline ? 4 : 1}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={!canSave || saving} onClick={saveTemplate}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2800}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback ? (
          <Alert onClose={() => setFeedback(null)} severity={feedback.severity} sx={{ width: "100%" }}>
            {feedback.message}
          </Alert>
        ) : null}
      </Snackbar>
    </div>
  );
};

export default TemplateCrudPage;
