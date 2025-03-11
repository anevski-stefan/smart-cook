'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { 
  RestaurantMenu, 
  AccountCircle, 
  Menu as MenuIcon,
  Home,
  Book,
  CameraAlt,
  Person,
  BookmarkBorder,
  Kitchen,
  ShoppingCart,
  Logout,
  Close
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleNavigation('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleClose();
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Recipes', path: '/recipes', icon: <Book /> },
    ...(user ? [{ text: 'Scan Ingredients', path: '/scan', icon: <CameraAlt /> }] : []),
  ];

  const userMenuItems = user ? [
    { text: 'Profile', path: '/profile', icon: <Person /> },
    { text: 'Saved Recipes', path: '/saved-recipes', icon: <BookmarkBorder /> },
    { text: 'My Ingredients', path: '/ingredients', icon: <Kitchen /> },
    { text: 'Shopping List', path: '/shopping-list', icon: <ShoppingCart /> },
  ] : [];

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <IconButton
          onClick={handleMobileMenuToggle}
          edge="start"
          sx={{ mr: 1 }}
        >
          <Close />
        </IconButton>
        <Typography variant="h6">
          Menu
        </Typography>
      </Box>

      {user && (
        <Box sx={{ 
          p: 2,
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          {user.user_metadata?.avatar_url ? (
            <Avatar
              src={user.user_metadata.avatar_url}
              alt={user.email || ''}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <Avatar sx={{ width: 40, height: 40 }}>
              <AccountCircle />
            </Avatar>
          )}
          <Box>
            <Typography variant="subtitle1">
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signed In
            </Typography>
          </Box>
        </Box>
      )}

      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding
          >
            <Button
              fullWidth
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                justifyContent: 'flex-start',
                px: 3,
                py: 2,
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: 0.2,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '& .MuiButton-startIcon': {
                  color: 'primary.main',
                  '& svg': { fontSize: 22 }
                }
              }}
              startIcon={item.icon}
            >
              {item.text}
            </Button>
          </ListItem>
        ))}

        {user && (
          <>
            <Divider sx={{ my: 1.5 }} />
            {userMenuItems.map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding
              >
                <Button
                  fullWidth
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 2,
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    letterSpacing: 0.2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '& .MuiButton-startIcon': {
                      color: 'text.secondary',
                      '& svg': { fontSize: 22 }
                    }
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={handleSignOut}
                sx={{ 
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 2,
                  color: 'error.main',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '&:hover': {
                    bgcolor: 'error.lighter',
                  },
                  '& .MuiButton-startIcon': {
                    color: 'error.main',
                    '& svg': { fontSize: 22 }
                  }
                }}
                startIcon={<Logout />}
              >
                Sign Out
              </Button>
            </ListItem>
          </>
        )}
        {!user && (
          <ListItem disablePadding>
            <Button
              fullWidth
              onClick={() => handleNavigation('/auth/login')}
              sx={{ 
                justifyContent: 'flex-start',
                px: 3,
                py: 2,
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: 0.2,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '& .MuiButton-startIcon': {
                  color: 'primary.main',
                  '& svg': { fontSize: 22 }
                }
              }}
              startIcon={<Person />}
            >
              Sign In
            </Button>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <RestaurantMenu sx={{ mr: 2 }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => handleNavigation('/')}
        >
          Smart Cook
        </Typography>
        
        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileMenuToggle}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {navigationItems.map((item) => (
              <Button 
                key={item.text}
                color="inherit" 
                component={Link} 
                href={item.path}
              >
                {item.text}
              </Button>
            ))}
            {user ? (
              <>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Avatar
                      src={user.user_metadata.avatar_url}
                      alt={user.email || ''}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem 
                      key={item.text}
                      component={Link} 
                      href={item.path}
                      onClick={handleClose}
                    >
                      {item.text}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                href="/auth/login"
              >
                Sign In
              </Button>
            )}
          </Box>
        )}
        {mobileMenu}
      </Toolbar>
    </AppBar>
  );
} 