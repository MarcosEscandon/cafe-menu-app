import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  Forest,
  CheckCircle,
  LocalFireDepartment,
  DoneAll,
  Cabin
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    menuItem: {
      name: string;
      price: number;
      preparationTime: number;
    };
    quantity: number;
    customizations: Array<{
      name: string;
      value: any;
      priceModifier: number;
    }>;
    subtotal: number;
  }>;
  totalAmount: number;
  status: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  notes?: string;
  estimatedTime: number;
  actualTime?: number;
  createdAt: string;
}

const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conectar a Socket.IO
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://cafe-menu-app-backend.onrender.com' 
      : 'http://localhost:5000';
    const newSocket = io(socketUrl);

    // Unirse a la sala de cocina
    newSocket.emit('join-kitchen');

    // Escuchar nuevos pedidos
    newSocket.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    // Escuchar actualizaciones de estado
    newSocket.on('order-status-update', (updatedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    });

    // Escuchar pedidos cancelados
    newSocket.on('order-cancelled', (cancelledOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order._id === cancelledOrder._id ? cancelledOrder : order
      ));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status });
      // Socket.IO manejará la actualización automática
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'warning';
      case 'confirmado': return 'info';
      case 'preparando': return 'secondary';
      case 'listo': return 'success';
      case 'entregado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return <AccessTime />;
      case 'confirmado': return <Forest />;
      case 'preparando': return <LocalFireDepartment />;
      case 'listo': return <CheckCircle />;
      case 'entregado': return <DoneAll />;
      default: return null;
    }
  };

  const activeOrders = orders.filter(order => 
    !['entregado', 'cancelado'].includes(order.status)
  );

  const completedOrders = orders.filter(order => 
    ['entregado', 'cancelado'].includes(order.status)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        <Cabin sx={{ mr: 2, verticalAlign: 'middle' }} />
        Cabaña del Bosque
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {orders.filter(o => o.status === 'pendiente').length}
            </Typography>
            <Typography variant="body2">Pendientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="info.main">
              {orders.filter(o => o.status === 'preparando').length}
            </Typography>
            <Typography variant="body2">Preparando</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {orders.filter(o => o.status === 'listo').length}
            </Typography>
            <Typography variant="body2">Listos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {activeOrders.length}
            </Typography>
            <Typography variant="body2">Activos</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Pedidos Activos */}
      <Typography variant="h5" gutterBottom>
        Pedidos Activos ({activeOrders.length})
      </Typography>
      
      {activeOrders.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay pedidos activos en este momento
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {activeOrders.map(order => (
            <Grid item xs={12} md={6} lg={4} key={order._id}>
              <Card sx={{ 
                border: order.status === 'listo' ? '2px solid' : '1px solid',
                borderColor: order.status === 'listo' ? 'success.main' : 'grey.300',
                bgcolor: order.status === 'listo' ? 'success.light' : 'background.paper'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      #{order.orderNumber}
                    </Typography>
                    <Chip 
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      icon={getStatusIcon(order.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    Cliente: {order.customerName}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Tipo: {order.orderType === 'dine-in' ? 'Mesa ' + order.tableNumber : 
                           order.orderType === 'takeaway' ? 'Para llevar' : 'Delivery'}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Tiempo estimado: {order.estimatedTime} min
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Items:
                  </Typography>
                  <List dense>
                    {order.items.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.menuItem.name}`}
                          secondary={item.customizations.length > 0 ? 
                            item.customizations.map(c => `${c.name}: ${c.value}`).join(', ') : 
                            ''
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {order.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Notas: {order.notes}
                    </Typography>
                  )}
                  
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Total: ${order.totalAmount.toFixed(2)}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {order.status === 'pendiente' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => updateOrderStatus(order._id, 'confirmado')}
                      >
                        Confirmar
                      </Button>
                    )}
                    {order.status === 'confirmado' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => updateOrderStatus(order._id, 'preparando')}
                      >
                        Iniciar Preparación
                      </Button>
                    )}
                    {order.status === 'preparando' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => updateOrderStatus(order._id, 'listo')}
                      >
                        Marcar como Listo
                      </Button>
                    )}
                    {order.status === 'listo' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => updateOrderStatus(order._id, 'entregado')}
                      >
                        Entregado
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pedidos Completados */}
      <Typography variant="h5" gutterBottom>
        Pedidos Completados ({completedOrders.length})
      </Typography>
      
      <Grid container spacing={2}>
        {completedOrders.map(order => (
          <Grid item xs={12} sm={6} md={4} key={order._id}>
            <Card sx={{ opacity: 0.7 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">
                    #{order.orderNumber}
                  </Typography>
                  <Chip 
                    label={order.status}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">
                  {order.customerName} - ${order.totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="caption" display="block">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KitchenView;
