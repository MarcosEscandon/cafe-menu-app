import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Badge,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Close,
  Forest
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

interface CartItem extends MenuItemType {
  quantity: number;
  customizations: Array<{
    name: string;
    value: any;
    priceModifier?: number;
  }>;
  subtotal: number;
}

const CustomerMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    tableNumber: '',
    orderType: 'dine-in',
    notes: ''
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

  const openItemDialog = (item: MenuItemType) => {
    setSelectedItem(item);
    setQuantity(1);
    setCustomizations({});
    
    // Inicializar personalizaciones requeridas
    if (item.customizationOptions) {
      const initialCustomizations: Record<string, any> = {};
      item.customizationOptions.forEach(option => {
        if (option.type === 'boolean') {
          initialCustomizations[option.name] = false;
        } else if (option.type === 'select' && option.options?.length) {
          initialCustomizations[option.name] = option.options[0];
        } else if (option.type === 'number') {
          initialCustomizations[option.name] = 1;
        }
      });
      setCustomizations(initialCustomizations);
    }
    
    setDialogOpen(true);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    let subtotal = selectedItem.price * quantity;
    
    // Calcular modificadores de precio por personalizaciones
    if (selectedItem.customizationOptions) {
      selectedItem.customizationOptions.forEach(option => {
        const customization = customizations[option.name];
        if (customization && option.priceModifier) {
          subtotal += option.priceModifier * quantity;
        }
      });
    }

    const cartItem: CartItem = {
      ...selectedItem,
      quantity,
      customizations: Object.entries(customizations).map(([name, value]) => {
        const option = selectedItem.customizationOptions?.find(opt => opt.name === name);
        return {
          name,
          value,
          priceModifier: option?.priceModifier || 0
        };
      }),
      subtotal
    };

    setCart([...cart, cartItem]);
    setDialogOpen(false);
  };

  
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const submitOrder = async () => {
    try {
      const orderData = {
        customerName: customerData.name,
        items: cart.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        orderType: customerData.orderType,
        tableNumber: customerData.tableNumber,
        notes: customerData.notes
      };

      await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/orders`, orderData);
      
      // Resetear estado
      setCart([]);
      setCustomerData({
        name: '',
        tableNumber: '',
        orderType: 'dine-in',
        notes: ''
      });
      setOrderDialogOpen(false);
      
      alert('¡Pedido enviado exitosamente!');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al enviar el pedido');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        <Forest sx={{ mr: 2, verticalAlign: 'middle' }} />
        Panel del Mesero
      </Typography>

      {/* Filtro por categorías */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

      {/* Carrito */}
      <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            <Badge badgeContent={cart.length} color="primary">
              <ShoppingCart />
            </Badge>
            Pedido Actual
          </Typography>
          <Typography variant="h6">
            Total: ${getTotalPrice().toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            disabled={cart.length === 0}
            onClick={() => setOrderDialogOpen(true)}
            startIcon={<Forest />}
          >
            Enviar a Cocina
          </Button>
        </Box>
      </Paper>

      {/* Grid de items del menú */}
      <Grid container spacing={3}>
        {filteredItems.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {item.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Typography variant="h6" color="primary.main">
                  ${item.price.toFixed(2)}
                </Typography>
                <Typography variant="caption" display="block">
                  Tiempo prep: {item.preparationTime}min
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => openItemDialog(item)}
                  disabled={!item.available}
                >
                  {item.available ? 'Agregar al Carrito' : 'No disponible'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de personalización */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Personalizar {selectedItem?.name}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ float: 'right' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Cantidad:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Remove />
              </IconButton>
              <Typography>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(quantity + 1)}>
                <Add />
              </IconButton>
            </Box>
          </Box>

          {selectedItem?.customizationOptions?.map(option => (
            <Box key={option.name} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {option.name}
                {option.required && ' *'}
                {option.priceModifier && ` (+$${option.priceModifier.toFixed(2)})`}
              </Typography>
              
              {option.type === 'boolean' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={customizations[option.name] || false}
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        [option.name]: e.target.checked
                      })}
                    />
                  }
                  label={option.name}
                />
              )}
              
              {option.type === 'select' && option.options && (
                <FormControl fullWidth>
                  <Select
                    value={customizations[option.name] || ''}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      [option.name]: e.target.value
                    })}
                  >
                    {option.options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={addToCart} variant="contained">
            Agregar al Carrito - ${((selectedItem?.price || 0) * quantity).toFixed(2)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de pedido */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Confirmar Pedido</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                required
              />
            </Grid>
                        <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Pedido</InputLabel>
                <Select
                  value={customerData.orderType}
                  onChange={(e) => setCustomerData({...customerData, orderType: e.target.value})}
                >
                  <MenuItem value="dine-in">Comer aquí</MenuItem>
                  <MenuItem value="takeaway">Para llevar</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Mesa"
                value={customerData.tableNumber}
                onChange={(e) => setCustomerData({...customerData, tableNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas adicionales"
                multiline
                rows={3}
                value={customerData.notes}
                onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6">Resumen del Pedido:</Typography>
          {cart.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>
                {item.quantity}x {item.name}
              </Typography>
              <Typography>${item.subtotal.toFixed(2)}</Typography>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ${getTotalPrice().toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancelar</Button>
          <Button onClick={submitOrder} variant="contained" disabled={!customerData.name}>
            Confirmar Pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerMenu;
