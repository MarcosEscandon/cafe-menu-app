import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Forest,
  Kitchen,
  AccountCircle,
  Logout,
  Landscape,
  Coffee,
  Payments,
  RestaurantMenu
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Forest sx={{ mr: 1 }} />
          <Landscape sx={{ mr: 1 }} />
          <Coffee sx={{ mr: 1 }} />
        </Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Café Bosque
          <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
            Bariloche en Mar del Plata
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            color="inherit" 
            startIcon={<Coffee />}
            onClick={() => navigate('/menu')}
          >
            Mesero
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<Kitchen />}
            onClick={() => navigate('/kitchen')}
          >
            Cocina
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<Payments />}
            onClick={() => navigate('/cashier')}
          >
            Caja
          </Button>

          {user && user.role === 'admin' && (
            <>
              <Button 
                color="inherit" 
                startIcon={<RestaurantMenu />}
                onClick={() => navigate('/menu-manager')}
                sx={{ mr: 2 }}
              >
                Menú
              </Button>
            </>
          )}

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
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
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
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    {user.name} ({user.role})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Ingresar al Bosque
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
