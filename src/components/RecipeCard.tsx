import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
} from '@mui/material';
import { AccessTime, SignalCellularAlt } from '@mui/icons-material';
import type { Recipe } from '@/types/ingredient';

export interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export default function RecipeCard({
  recipe,
  onClick
}: RecipeCardProps) {
  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={onClick} sx={{ flex: 1 }}>
        <CardMedia
          component="img"
          height="160"
          image={recipe.image}
          alt={recipe.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {recipe.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {recipe.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<AccessTime fontSize="small" />}
              label={`${recipe.readyInMinutes} min`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<SignalCellularAlt fontSize="small" />}
              label={recipe.difficulty}
              size="small"
              color={getComplexityColor(recipe.difficulty)}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 