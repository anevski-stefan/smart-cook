'use client';

import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { RestaurantMenu, AccountCircle } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleNavigation('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleClose();
  };

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            href="/"
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            href="/recipes"
          >
            Recipes
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            href="/scan"
          >
            Scan Ingredients
          </Button>
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
                <MenuItem 
                  component={Link} 
                  href="/profile"
                  onClick={handleClose}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  href="/saved-recipes"
                  onClick={handleClose}
                >
                  Saved Recipes
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  href="/ingredients"
                  onClick={handleClose}
                >
                  My Ingredients
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  href="/shopping-list"
                  onClick={handleClose}
                >
                  Shopping List
                </MenuItem>
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
      </Toolbar>
    </AppBar>
  );
} 