'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from './LanguageSelector';

type NavigationPage = 'search' | 'scan' | 'education' | 'chat';
type SettingsKey = 'profile' | 'saved-recipes' | 'shopping-list' | 'ingredients' | 'my-recipes' | 'sign-out';
type SettingsLabel = 'navigation.profile' | 'navigation.savedRecipes' | 'navigation.shoppingList' | 'recipe.ingredients' | 'navigation.myRecipes' | 'common.signOut';

interface SettingsItem {
  key: SettingsKey;
  label: SettingsLabel;
}

const pages: NavigationPage[] = ['search', 'scan', 'education', 'chat'];
const settings: SettingsItem[] = [
  { key: 'profile', label: 'navigation.profile' },
  { key: 'my-recipes', label: 'navigation.myRecipes' },
  { key: 'saved-recipes', label: 'navigation.savedRecipes' },
  { key: 'shopping-list', label: 'navigation.shoppingList' },
  { key: 'ingredients', label: 'recipe.ingredients' },
  { key: 'sign-out', label: 'common.signOut' }
];

const getTranslationKey = (page: NavigationPage): 'common.search' | 'navigation.scan' | 'navigation.education' | 'navigation.chat' => {
  switch (page) {
    case 'search':
      return 'common.search';
    case 'scan':
      return 'navigation.scan';
    case 'education':
      return 'navigation.education';
    case 'chat':
      return 'navigation.chat';
  }
};

export default function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path: string) => {
    if (path === '/sign-out') {
      signOut();
    } else if (path === '/profile') {
      router.push('/account/profile');
    } else if (path === '/saved-recipes') {
      router.push('/account/saved-recipes');
    } else if (path === '/shopping-list') {
      router.push('/account/shopping-list');
    } else if (path === '/ingredients') {
      router.push('/account/ingredients');
    } else if (path === '/my-recipes') {
      router.push('/account/my-recipes');
    } else {
      router.push(path);
    }
    handleCloseUserMenu();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleCloseUserMenu();
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <RestaurantIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'white' }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Smart Cook
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavigation(`/${page}`)}>
                  <Typography textAlign="center">
                    {t(getTranslationKey(page))}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <RestaurantIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'white' }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Smart Cook
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavigation(`/${page}`)}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {t(getTranslationKey(page))}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <LanguageSelector />
            
            {user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar src={user?.user_metadata?.avatar_url} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem 
                      key={setting.key} 
                      onClick={() => {
                        if (setting.key === 'sign-out') {
                          handleSignOut();
                        } else {
                          handleNavigation(`/${setting.key}`);
                          handleCloseUserMenu();
                        }
                      }}
                    >
                      <Typography textAlign="center">{t(setting.label)}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => handleNavigation('/auth/login')}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'primary.dark',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {t('common.signIn')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 