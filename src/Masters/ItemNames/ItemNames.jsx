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

const ItemNames = () => {
  const { categoryId, subCatId } = useParams();
  const theme = useTheme();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subCatId || "");
  const [itemNames, setItemNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogCategoryId, setDialogCategoryId] = useState("");
  const [dialogSubcategoryId, setDialogSubcategoryId] = useState("");
  const [dialogItemName, setDialogItemName] = useState("");
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("name", "desc"));
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }

    const fetchSubcategories = async () => {
      const q = query(
        collection(db, "categories", selectedCategoryId, "subcategories"),
        orderBy("name", "desc")
      );
      const snapshot = await getDocs(q);
      setSubcategories(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
    };

    fetchSubcategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId || !selectedSubcategoryId) {
      setItemNames([]);
      return undefined;
    }

    const q = query(
      collection(
        db,
        "categories",
        selectedCategoryId,
        "subcategories",
        selectedSubcategoryId,
        "itemNames"
      ),
      orderBy("name", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItemNames(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedSubcategoryId, selectedCategoryId]);

  const visibleItemNames = useMemo(
    () => itemNames.filter((item) => showArchived || isActiveRecord(item)),
    [itemNames, showArchived]
  );

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
    setSubcategories([]);
    setSelectedSubcategoryId("");
  };

  const openCreateDialog = () => {
    setSelectedItem(null);
    setDialogCategoryId(selectedCategoryId || "");
    setDialogSubcategoryId(selectedSubcategoryId || "");
    setDialogItemName("");
    setAllSubcategories(subcategories);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setDialogCategoryId(selectedCategoryId);
    setDialogSubcategoryId(selectedSubcategoryId);
    setDialogItemName(item?.name || "");
    setAllSubcategories(subcategories);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setDialogCategoryId("");
    setDialogSubcategoryId("");
    setDialogItemName("");
  };

  const handleDialogCategoryChange = async (event) => {
    const nextCategoryId = event.target.value;
    setDialogCategoryId(nextCategoryId);
    const q = query(
      collection(db, "categories", nextCategoryId, "subcategories"),
      orderBy("name", "desc")
    );
    const snapshot = await getDocs(q);
    setAllSubcategories(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
    setDialogSubcategoryId("");
  };

  const saveItem = async () => {
    try {
      setSaving(true);

      if (selectedItem) {
        await updateDoc(
          doc(
            db,
            "categories",
            selectedCategoryId,
            "subcategories",
            selectedSubcategoryId,
            "itemNames",
            selectedItem.id
          ),
          {
            name: dialogItemName.trim(),
            updatedAt: serverTimestamp(),
          }
        );
      } else {
        await addDoc(
          collection(
            db,
            "categories",
            dialogCategoryId,
            "subcategories",
            dialogSubcategoryId,
            "itemNames"
          ),
          {
            name: dialogItemName.trim(),
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving item name:", error);
    } finally {
      setSaving(false);
    }
  };

  const archiveItem = async (item) => {
    await updateDoc(
      doc(db, "categories", selectedCategoryId, "subcategories", selectedSubcategoryId, "itemNames", item.id),
      {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
  };

  const restoreItem = async (item) => {
    await updateDoc(
      doc(db, "categories", selectedCategoryId, "subcategories", selectedSubcategoryId, "itemNames", item.id),
      {
        active: true,
        archivedAt: null,
        updatedAt: serverTimestamp(),
      }
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
            labelId="category-select-label"
            label="Select Category"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
          >
            {categories.filter(isActiveRecord).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="subcategory-select-label">Select Subcategory</InputLabel>
          <Select
            labelId="subcategory-select-label"
            label="Select Subcategory"
            value={selectedSubcategoryId}
            onChange={(event) => setSelectedSubcategoryId(event.target.value)}
            disabled={!selectedCategoryId}
          >
            {subcategories.filter(isActiveRecord).map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
          Add Item Name
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress size={54} />
      ) : visibleItemNames.length > 0 ? (
        <Grid container spacing={2}>
          {visibleItemNames.map((itemName) => {
            const active = isActiveRecord(itemName);

            return (
              <Grid item xs={12} sm={6} md={4} key={itemName.id}>
                <Card sx={{ borderLeft: `${theme.palette.primary.main} 5px solid`, opacity: active ? 1 : 0.68 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ color: theme.palette.primary.main, overflowWrap: "break-word" }} variant="h6">
                        {itemName.name}
                      </Typography>
                      <Chip size="small" label={active ? "Active" : "Archived"} color={active ? "success" : "default"} />
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditDialog(itemName)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {active ? (
                      <Tooltip title="Archive">
                        <IconButton size="small" onClick={() => archiveItem(itemName)}>
                          <ArchiveOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Restore">
                        <IconButton size="small" onClick={() => restoreItem(itemName)}>
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
        <p>No item names found for this subcategory.</p>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{selectedItem ? "Edit Item Name" : "Add Item Name"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {!selectedItem ? (
            <>
              <FormControl fullWidth>
                <InputLabel id="dialog-category-select-label">Category</InputLabel>
                <Select
                  labelId="dialog-category-select-label"
                  label="Category"
                  value={dialogCategoryId}
                  onChange={handleDialogCategoryChange}
                >
                  {categories.filter(isActiveRecord).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="dialog-subcategory-select-label">Subcategory</InputLabel>
                <Select
                  labelId="dialog-subcategory-select-label"
                  label="Subcategory"
                  value={dialogSubcategoryId}
                  onChange={(event) => setDialogSubcategoryId(event.target.value)}
                  disabled={!dialogCategoryId}
                >
                  {allSubcategories.filter(isActiveRecord).map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : null}
          <TextField
            autoFocus
            label="Item Name"
            value={dialogItemName}
            onChange={(event) => setDialogItemName(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={saveItem}
            disabled={!dialogSubcategoryId || dialogItemName.trim() === "" || saving}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ItemNames;
