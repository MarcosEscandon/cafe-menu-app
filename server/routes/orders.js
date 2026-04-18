const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { io } = require('../index');

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
router.post('/', async (req, res) => {
  try {
    const { customerName, items, orderType, tableNumber, notes } = req.body;
    
    // Validar y calcular totales
    let totalAmount = 0;
    let maxPreparationTime = 0;
    const processedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ message: `Item ${item.menuItemId} no disponible` });
      }
      
      let itemTotal = menuItem.price * item.quantity;
      
      // Procesar personalizaciones
      const processedCustomizations = [];
      if (item.customizations) {
        for (const customization of item.customizations) {
          const option = menuItem.customizationOptions.find(opt => opt.name === customization.name);
          if (option) {
            let priceModifier = 0;
            if (option.priceModifier) priceModifier = option.priceModifier;
            
            processedCustomizations.push({
              name: customization.name,
              value: customization.value,
              priceModifier
            });
            
            if (priceModifier) {
              itemTotal += priceModifier * item.quantity;
            }
          }
        }
      }
      
      processedItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        customizations: processedCustomizations,
        subtotal: itemTotal
      });
      
      totalAmount += itemTotal;
      maxPreparationTime = Math.max(maxPreparationTime, menuItem.preparationTime);
    }
    
    const order = new Order({
      customerName,
      items: processedItems,
      totalAmount,
      orderType,
      tableNumber,
      notes,
      estimatedTime: maxPreparationTime
    });
    
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
