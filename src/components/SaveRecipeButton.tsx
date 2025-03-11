import { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecipe, unsaveRecipe, getSavedRecipes } from '@/utils/supabase-client';

interface SaveRecipeButtonProps {
  recipeId: string;
}

export default function SaveRecipeButton({ recipeId }: SaveRecipeButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (user) {
        try {
          const savedRecipes = await getSavedRecipes();
          setIsSaved(savedRecipes.includes(recipeId));
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
      setLoading(false);
    };

    checkIfSaved();
  }, [user, recipeId]);

  const handleToggleSave = async () => {
    if (!user) {
      // TODO: Show login prompt
      return;
    }

    try {
      if (isSaved) {
        await unsaveRecipe(recipeId);
        setIsSaved(false);
      } else {
        await saveRecipe(recipeId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Tooltip title={isSaved ? 'Remove from saved recipes' : 'Save recipe'}>
      <IconButton onClick={handleToggleSave} color={isSaved ? 'primary' : 'default'}>
        {isSaved ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
    </Tooltip>
  );
} 