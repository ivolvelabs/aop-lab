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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
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
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";

const isActiveRecord = (record) =>
  record?.active !== false && !record?.archivedAt;

const normalize = (value) => String(value || "").toLowerCase().trim();

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setCategories(querySnapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = normalize(searchTerm);

    return categories.filter((category) => {
      const active = isActiveRecord(category);
      if (!showArchived && !active) return false;
      if (!term) return true;
      return normalize(category.name).includes(term);
    });
  }, [categories, searchTerm, showArchived]);

  const openCreateDialog = () => {
    setSelectedCategory(null);
    setName("");
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setName(category?.name || "");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setName("");
  };

  const saveCategory = async () => {
    try {
      setSaving(true);

      if (selectedCategory) {
        await updateDoc(doc(db, "categories", selectedCategory.id), {
          name: name.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const year = new Date().getFullYear().toString().substring(2);
        const docRef = doc(collection(db, "categories"));
        await setDoc(docRef, {
          id: docRef.id,
          name: name.trim(),
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          years: [
            {
              year,
              rnSeries: `AOP/${name.trim().substring(0, 1).toUpperCase()}/${year}`,
              crNumber: 0,
            },
          ],
        });
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  const archiveCategory = async (category) => {
    await updateDoc(doc(db, "categories", category.id), {
      active: false,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const restoreCategory = async (category) => {
    await updateDoc(doc(db, "categories", category.id), {
      active: true,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 2 }}>
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          type="search"
          label="Search categories"
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Add Category"}
        </Button>
      </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{selectedCategory ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            required
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={name.trim() === "" || saving} onClick={saveCategory}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {!loading && filteredCategories.length > 0 ? (
        <Grid container spacing={2}>
          {filteredCategories.map((category) => {
            const active = isActiveRecord(category);

            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card sx={{ borderLeft: `${theme.palette.primary.main} 5px solid`, opacity: active ? 1 : 0.68 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ color: theme.palette.primary.main, overflowWrap: "break-word" }} variant="h6">
                        {category.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={active ? "Active" : "Archived"}
                        color={active ? "success" : "default"}
                        variant={active ? "filled" : "outlined"}
                      />
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/masters/${category.id}`)}>
                      Open
                    </Button>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditDialog(category)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {active ? (
                      <Tooltip title="Archive">
                        <IconButton size="small" onClick={() => archiveCategory(category)}>
                          <ArchiveOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Restore">
                        <IconButton size="small" onClick={() => restoreCategory(category)}>
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
        <p>{loading ? <CircularProgress size={54} /> : "No categories found."}</p>
      )}
    </div>
  );
};

export default Category;
