const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usuarios simulados para demostración
const users = [
  {
    id: 1,
    email: 'admin@cafe.com',
    password: '$2a$10$HHtNQKEBLaQDfHz8p5rOsOWmr11v7pMF2CKWAN3C1/44Nu/7c9cR6', // 'admin123'
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: 2,
    email: 'kitchen@cafe.com',
    password: '$2a$10$pkdYqbWd4aBT4ypShn2zDua6AGDnrS8bKXUA9zrQnwjCC60IwjMVq', // 'kitchen123'
    role: 'kitchen',
    name: 'Cocina'
  },
  {
    id: 3,
    email: 'mesero@cafe.com',
    password: '$2a$10$EqtJigqwWg9oHcXfoTe2DOwbuPLYTqJThJf32.VxZPjLF377GXcme', // 'mesero123'
    role: 'waiter',
    name: 'Mesero'
  },
  {
    id: 4,
    email: 'caja@cafe.com',
    password: '$2a$10$6PNg57ddg2cz0fdVy0Jmk.Eb330h6FJ0N6ZDJX3rgnzf2q.y2rooS', // 'caja123'
    role: 'cashier',
    name: 'Caja'
  }
];

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router;
