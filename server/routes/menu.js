const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { body, validationResult } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');

// Obtener todos los items del menú
router.get('/', async (req, res) => {
  try {
    const { category, available, page, limit } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';
    
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
      const skip = (pageNum - 1) * limitNum;
      
      const [menuItems, total] = await Promise.all([
        MenuItem.find(filter).sort({ category: 1, name: 1 }).skip(skip).limit(limitNum),
        MenuItem.countDocuments(filter)
      ]);
      
      return res.json({
        items: menuItems,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    }
    
    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el menú', error: error.message });
  }
});

// Obtener categorías disponibles
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
});

// Obtener un item específico
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el item', error: error.message });
  }
});

// Crear nuevo item (admin)
router.post('/', authenticate, requireRole('admin'), [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').trim().isLength({ min: 1, max: 500 }).escape(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').isIn(['café', 'té', 'postres', 'sandwiches', 'bebidas', 'otros']),
  body('available').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear item', error: error.message });
  }
});

// Actualizar item (admin)
router.put('/:id', authenticate, requireRole('admin'), [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').trim().isLength({ min: 1, max: 500 }).escape(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').isIn(['café', 'té', 'postres', 'sandwiches', 'bebidas', 'otros']),
  body('available').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, category, available, customizationOptions, preparationTime } = req.body;
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, available, customizationOptions, preparationTime },
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar item', error: error.message });
  }
});

// Eliminar item (admin)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar item', error: error.message });
  }
});

module.exports = router;
