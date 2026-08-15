import React, { useEffect, useMemo, useState } from "react";
import {
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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
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
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { db } from "../../firebase";

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalize = (value) => String(value || "").toLowerCase().trim();

const SubCategories = () => {
  const { categoryId } = useParams();
  const theme = useTheme();

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [name, setName] = useState("");
  const [dialogCategory, setDialogCategory] = useState("");
  const [categories, setAvailableCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("name", "desc"));
      const snapshot = await getDocs(q);
      setAvailableCategories(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q = query(
      collection(db, "categories", selectedCategoryId, "subcategories"),
      orderBy("name", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubcategories(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategoryId]);

  const filteredSubcategories = useMemo(() => {
    const term = normalize(searchTerm);

    return subcategories.filter((subcategory) => {
      const active = isActiveRecord(subcategory);
      if (!showArchived && !active) return false;
      if (!term) return true;
      return normalize(subcategory.name).includes(term);
    });
  }, [searchTerm, showArchived, subcategories]);

  const openCreateDialog = () => {
    setSelectedSubcategory(null);
    setName("");
    setDialogCategory(selectedCategoryId || "");
    setDialogOpen(true);
  };

  const openEditDialog = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setName(subcategory?.name || "");
    setDialogCategory(selectedCategoryId || "");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedSubcategory(null);
    setName("");
    setDialogCategory("");
  };

  const saveSubcategory = async () => {
    try {
      setSaving(true);
      const targetCategory = selectedSubcategory ? selectedCategoryId : dialogCategory;
      const subcategoryRef = selectedSubcategory
        ? doc(db, "categories", selectedCategoryId, "subcategories", selectedSubcategory.id)
        : collection(db, "categories", targetCategory, "subcategories");

      if (selectedSubcategory) {
        await updateDoc(subcategoryRef, {
          name: name.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(subcategoryRef, {
          name: name.trim(),
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving subcategory:", error);
    } finally {
      setSaving(false);
    }
  };

  const archiveSubcategory = async (subcategory) => {
    await updateDoc(doc(db, "categories", selectedCategoryId, "subcategories", subcategory.id), {
      active: false,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const restoreSubcategory = async (subcategory) => {
    await updateDoc(doc(db, "categories", selectedCategoryId, "subcategories", subcategory.id), {
      active: true,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 2 }}>
        <FormControl size="small" fullWidth>
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
            labelId="category-select-label"
            label="Select Category"
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
          >
            {categories.filter(isActiveRecord).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          label="Search subcategories"
          type="search"
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
        <Button variant="contained" onClick={openCreateDialog} disabled={!selectedCategoryId}>
          Add Subcategory
        </Button>
      </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{selectedSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            required
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          {!selectedSubcategory ? (
            <FormControl fullWidth>
              <InputLabel id="dialog-category-select-label">Select Category</InputLabel>
              <Select
                labelId="dialog-category-select-label"
                label="Select Category"
                value={dialogCategory}
                onChange={(event) => setDialogCategory(event.target.value)}
              >
                {categories.filter(isActiveRecord).map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            disabled={name.trim() === "" || (!selectedSubcategory && dialogCategory === "") || saving}
            onClick={saveSubcategory}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {!loading && filteredSubcategories.length > 0 ? (
        <Grid container spacing={2}>
          {filteredSubcategories.map((subcategory) => {
            const active = isActiveRecord(subcategory);

            return (
              <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
                <Card sx={{ borderLeft: `${theme.palette.primary.main} 5px solid`, opacity: active ? 1 : 0.68 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ color: theme.palette.primary.main, overflowWrap: "break-word" }} variant="h6">
                        {subcategory.name}
                      </Typography>
                      <Chip size="small" label={active ? "Active" : "Archived"} color={active ? "success" : "default"} />
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditDialog(subcategory)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {active ? (
                      <Tooltip title="Archive">
                        <IconButton size="small" onClick={() => archiveSubcategory(subcategory)}>
                          <ArchiveOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Restore">
                        <IconButton size="small" onClick={() => restoreSubcategory(subcategory)}>
                          <RestoreOutlined fontSize="small" />
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
        <p>{loading ? <CircularProgress size={54} /> : "No subcategories found."}</p>
      )}
    </div>
  );
};

export default SubCategories;
