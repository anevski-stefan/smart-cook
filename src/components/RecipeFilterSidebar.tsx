import {
  Box,
  Drawer,
  Typography,
  Slider,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useState } from 'react';

export interface RecipeFilters {
  searchTerm: string;
  cookingTime: [number, number];
  complexity: ('Easy' | 'Medium' | 'Hard')[];
  mealType: string[];
  dietary: string[];
}

interface RecipeFilterSidebarProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  open: boolean;
  onClose: () => void;
}

const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Appetizer'
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Keto'
];

const COMPLEXITY_LEVELS = ['Easy', 'Medium', 'Hard'];

export default function RecipeFilterSidebar({ 
  filters, 
  onFiltersChange, 
  open, 
  onClose 
}: RecipeFilterSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleTimeChange = (event: Event, newValue: number | number[]) => {
    onFiltersChange({
      ...filters,
      cookingTime: newValue as [number, number]
    });
  };

  const handleComplexityChange = (level: string) => {
    const newComplexity = filters.complexity.includes(level as any)
      ? filters.complexity.filter(c => c !== level)
      : [...filters.complexity, level] as ('Easy' | 'Medium' | 'Hard')[];
    
    onFiltersChange({
      ...filters,
      complexity: newComplexity
    });
  };

  const handleMealTypeChange = (type: string) => {
    const newTypes = filters.mealType.includes(type)
      ? filters.mealType.filter(t => t !== type)
      : [...filters.mealType, type];
    
    onFiltersChange({
      ...filters,
      mealType: newTypes
    });
  };

  const handleDietaryChange = (option: string) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter(d => d !== option)
      : [...filters.dietary, option];
    
    onFiltersChange({
      ...filters,
      dietary: newDietary
    });
  };

  const drawerContent = (
    <Box sx={{ width: 280, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Filter Recipes
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search recipes"
          value={filters.searchTerm}
          onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
          size="small"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cooking Time (minutes)
        </Typography>
        <Slider
          value={filters.cookingTime}
          onChange={handleTimeChange}
          valueLabelDisplay="auto"
          min={0}
          max={180}
          step={15}
          marks={[
            { value: 0, label: '0m' },
            { value: 60, label: '1h' },
            { value: 120, label: '2h' },
            { value: 180, label: '3h+' },
          ]}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Complexity
        </Typography>
        <FormGroup>
          {COMPLEXITY_LEVELS.map((level) => (
            <FormControlLabel
              key={level}
              control={
                <Checkbox
                  checked={filters.complexity.includes(level as any)}
                  onChange={() => handleComplexityChange(level)}
                  size="small"
                />
              }
              label={level}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Meal Type
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {MEAL_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              onClick={() => handleMealTypeChange(type)}
              color={filters.mealType.includes(type) ? 'primary' : 'default'}
              variant={filters.mealType.includes(type) ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Dietary Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {DIETARY_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              onClick={() => handleDietaryChange(option)}
              color={filters.dietary.includes(option) ? 'secondary' : 'default'}
              variant={filters.dietary.includes(option) ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onClose}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            height: '100%',
            overflow: 'auto'
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
} 