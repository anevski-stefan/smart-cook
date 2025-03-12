'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/utils/supabase-client';
import { useTranslation } from '@/hooks/useTranslation';

interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

export default function ShoppingListPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    unit: '',
  });

  const fetchShoppingList = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      // Don't set error message during initial load to avoid infinite loop
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Remove t from dependencies since we're not using it in fetchShoppingList anymore

  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

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
      setMessage({ type: 'success', text: t('shoppingList.updateSuccess') });
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage({ type: 'error', text: t('shoppingList.updateError') });
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
      setMessage({ type: 'success', text: t('shoppingList.deleteSuccess') });
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: t('shoppingList.deleteError') });
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
      setMessage({ type: 'success', text: t('shoppingList.addSuccess') });
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage({ type: 'error', text: t('shoppingList.addError') });
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
      setMessage({ type: 'success', text: t('shoppingList.deleteSuccess') });
    } catch (error) {
      console.error('Error clearing checked items:', error);
      setMessage({ type: 'error', text: t('shoppingList.deleteError') });
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
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
            {t('navigation.shoppingList')}
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
              {t('shoppingList.addItem')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearChecked}
              disabled={!items.some((item) => item.checked)}
              fullWidth={isMobile}
            >
              {t('shoppingList.clearChecked')}
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
              {t('shoppingList.empty')}
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
                        aria-label={t('common.delete')}
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
          <DialogTitle>{t('shoppingList.addItemTitle')}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                label={t('shoppingList.itemName')}
                fullWidth
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <TextField
                label={t('shoppingList.amount')}
                type="number"
                fullWidth
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              />
              <TextField
                label={t('shoppingList.unit')}
                fullWidth
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleAddItem} 
              variant="contained"
              disabled={!newItem.name || !newItem.amount || !newItem.unit}
            >
              {t('shoppingList.addToList')}
            </Button>
          </DialogActions>
        </Dialog>

        {message && (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={handleCloseMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseMessage} severity={message.type}>
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Container>
    </ProtectedRoute>
  );
} 