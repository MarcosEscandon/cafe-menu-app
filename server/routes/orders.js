const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { io } = require('../index');
const { body, validationResult } = require('express-validator');

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }
    
    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name price preparationTime')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
});

// Obtener un pedido específico
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price preparationTime customizationOptions');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedido', error: error.message });
  }
});

// Crear nuevo pedido
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.menuItemId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('customerName').optional().trim().isLength({ min: 1, max: 50 }).escape(),
  body('orderType').isIn(['dine-in', 'takeaway', 'delivery']),
  body('tableNumber').optional().trim().isLength({ min: 1, max: 10 }),
  body('notes').optional().trim().isLength({ min: 0, max: 200 }).escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, customerName, orderType, tableNumber, notes } = req.body;

    // Validar que todos los items existan
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: 'Algunos items del menú no existen' });
    }

    // Crear items del pedido con estructura correcta
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
      return {
        menuItem: item.menuItemId,
        quantity: item.quantity,
        customizations: item.customizations || [],
        subtotal: menuItem.price * item.quantity
      };
    });

    // Calcular tiempo estimado total
    const maxPrepTime = Math.max(...menuItems.map(item => item.preparationTime || 5));

    // Crear el pedido
    const order = new Order({
      customerName: customerName || 'Cliente',
      items: orderItems,
      orderType,
      tableNumber: tableNumber || '',
      notes: notes || '',
      status: 'pendiente',
      estimatedTime: maxPrepTime,
      totalAmount: 0
    });

    // Calcular total
    order.totalAmount = items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
      return total + (menuItem.price * item.quantity);
    }, 0);

    await order.save();
    
    // Notificar a la cocina
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price preparationTime');
    
    io.to('kitchen').emit('new-order', populatedOrder);
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear pedido', error: error.message });
  }
});

// Actualizar estado del pedido
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, actualTime } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(actualTime && { actualTime })
      },
      { new: true }
    ).populate('items.menuItem', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Notificar cambio de estado
    io.emit('order-status-update', order);
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar estado', error: error.message });
  }
});

// Cancelar pedido
router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    ).populate('items.menuItem', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    io.emit('order-cancelled', order);
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error al cancelar pedido', error: error.message });
  }
});

module.exports = router;
