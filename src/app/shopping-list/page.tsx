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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      <Container maxWidth="md" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          gap={2}
          mb={3}
        >
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mb: { xs: 1, sm: 0 }
            }}
          >
            Shopping List
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'row' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(true)}
              startIcon={<AddIcon />}
              fullWidth={isMobile}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearChecked}
              disabled={!items.some((item) => item.checked)}
              fullWidth={isMobile}
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
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography color="text.secondary" align="center">
              Your shopping list is empty.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ overflow: 'hidden' }}>
            <List sx={{ width: '100%' }}>
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  divider
                  sx={{
                    textDecoration: item.checked ? 'line-through' : 'none',
                    color: item.checked ? 'text.disabled' : 'text.primary',
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <Checkbox
                      edge="start"
                      checked={item.checked}
                      onChange={() => handleToggleCheck(item.id)}
                    />
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            color: 'text.secondary'
                          }}
                        >
                          {`${item.amount} ${item.unit}`}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{ ml: { xs: 0, sm: 1 } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add Item to Shopping List</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                label="Item Name"
                fullWidth
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              />
              <TextField
                label="Unit"
                fullWidth
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddItem} 
              variant="contained"
              disabled={!newItem.name || !newItem.amount || !newItem.unit}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
} 