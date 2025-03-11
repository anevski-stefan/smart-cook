'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/utils/supabase-client';

interface ShoppingListItem {
  id: string;  // Change to string since Supabase uses UUID
  user_id: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

export default function ShoppingListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    unit: '',
  });

  useEffect(() => {
    if (user) {
      fetchShoppingList();
    }
  }, [user]);

  const fetchShoppingList = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = async (itemId: string) => {
    const targetItem = items.find((item) => item.id === itemId);
    if (!targetItem) return;

    try {
      const updatedItems = items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      setItems(updatedItems);

      const { error } = await supabase
        .from('shopping_list')
        .update({ checked: !targetItem.checked })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      if (!newItem.name || !newItem.amount || !newItem.unit) {
        return;
      }

      const { data, error } = await supabase
        .from('shopping_list')
        .insert([
          {
            user_id: user?.id || '',
            name: newItem.name,
            amount: parseFloat(newItem.amount),
            unit: newItem.unit,
            checked: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setItems([...items, data as ShoppingListItem]);
      setOpenDialog(false);
      setNewItem({ name: '', amount: '', unit: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleClearChecked = async () => {
    try {
      const checkedIds = items.filter((item) => item.checked).map((item) => item.id);

      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .in('id', checkedIds);

      if (error) throw error;

      setItems(items.filter((item) => !item.checked));
    } catch (error) {
      console.error('Error clearing checked items:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Shopping List
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(true)}
              startIcon={<AddIcon />}
              sx={{ mr: 2 }}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearChecked}
              disabled={!items.some((item) => item.checked)}
            >
              Clear Checked
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary" align="center">
              Your shopping list is empty.
            </Typography>
          </Paper>
        ) : (
          <Paper>
            <List>
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  divider
                  sx={{
                    textDecoration: item.checked ? 'line-through' : 'none',
                    color: item.checked ? 'text.disabled' : 'text.primary',
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={item.checked}
                    onChange={() => handleToggleCheck(item.id)}
                  />
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.amount} ${item.unit}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add Item to Shopping List</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Item Name"
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Unit"
              fullWidth
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
} 