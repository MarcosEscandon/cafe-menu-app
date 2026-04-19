import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Restaurant,
  Close
} from '@mui/icons-material';
import axios from 'axios';

interface MenuItemType {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  customizationOptions?: Array<{
    name: string;
    type: 'boolean' | 'select' | 'number';
    options?: string[];
    priceModifier?: number;
    required: boolean;
  }>;
  preparationTime?: number;
}

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItemType>>({
    name: '',
    description: '',
    price: 0,
    category: 'café',
    available: true,
    preparationTime: 10
  });

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/menu/categories/list`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredItems = selectedCategory === 'todos' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const openEditDialog = (item: MenuItemType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      preparationTime: item.preparationTime || 10
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'café',
      available: true,
      preparationTime: 10
    });
    setDialogOpen(true);
  };

  const saveMenuItem = async () => {
    try {
      if (editingItem) {
        // Actualizar item existente
        await axios.put(`${process.env.REACT_APP_API_URL || ''}/api/menu/${editingItem._id}`, formData);
      } else {
        // Crear nuevo item
        await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/menu`, formData);
      }
      
      setDialogOpen(false);
      fetchMenu(); // Refrescar la lista
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error al guardar el item del menú');
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este item?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || ''}/api/menu/${id}`);
        fetchMenu(); // Refrescar la lista
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Error al eliminar el item del menú');
      }
    }
  };

  const toggleAvailability = async (item: MenuItemType) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || ''}/api/menu/${item._id}`, {
        ...item,
        available: !item.available
      });
      fetchMenu(); // Refrescar la lista
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        <Restaurant sx={{ mr: 2, verticalAlign: 'middle' }} />
        Administrador de Menú
      </Typography>

      {/* Controles superiores */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Todos"
            onClick={() => setSelectedCategory('todos')}
            color={selectedCategory === 'todos' ? 'primary' : 'default'}
          />
          {categories.map(category => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
            />
          ))}
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Agregar Item
        </Button>
      </Paper>

      {/* Grid de items del menú */}
      <Grid container spacing={3}>
        {filteredItems.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(item)}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteMenuItem(item._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="primary.main">
                    ${item.price.toFixed(2)}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.available}
                        onChange={() => toggleAvailability(item)}
                        color="primary"
                      />
                    }
                    label="Disponible"
                  />
                </Box>
                
                <Typography variant="caption" display="block">
                  Categoría: {item.category}
                </Typography>
                <Typography variant="caption" display="block">
                  Tiempo prep: {item.preparationTime}min
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de edición/creación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Editar Item' : 'Nuevo Item'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ float: 'right' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category || 'café'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <MenuItem value="café">Café</MenuItem>
                  <MenuItem value="té">Té</MenuItem>
                  <MenuItem value="postres">Postres</MenuItem>
                  <MenuItem value="sandwiches">Sandwiches</MenuItem>
                  <MenuItem value="bebidas">Bebidas</MenuItem>
                  <MenuItem value="otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiempo de preparación (min)"
                type="number"
                value={formData.preparationTime || 10}
                onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available || false}
                    onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    color="primary"
                  />
                }
                label="Disponible"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button onClick={saveMenuItem} variant="contained" startIcon={<Save />}>
            {editingItem ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuManager;
