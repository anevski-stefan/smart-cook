import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import Link from 'next/link';
import type { Recipe } from '@/types/ingredient';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card elevation={2}>
      <CardActionArea component={Link} href={`/recipes/${recipe.id}`}>
        <CardMedia
          component="img"
          height="200"
          image={recipe.image}
          alt={recipe.title}
        />
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom noWrap>
            {recipe.title}
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Chip
              size="small"
              icon={<AccessTimeIcon />}
              label={`${recipe.readyInMinutes} min`}
            />
            <Chip
              size="small"
              icon={<GroupIcon />}
              label={`${recipe.servings} servings`}
            />
            <Chip
              size="small"
              icon={<RestaurantIcon />}
              label={recipe.cuisine}
            />
            <Chip
              size="small"
              icon={<SignalCellularAltIcon />}
              label={recipe.difficulty}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {recipe.description.replace(/<[^>]*>/g, '')}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 