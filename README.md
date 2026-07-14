# Café Menu App

Aplicación completa de menú de café con pedidos en tiempo real.

## Características

- **Menú interactivo**: Clientes pueden ver productos, personalizarlos y agregar al carrito
- **Personalización avanzada**: Opciones de tamaño, sabor, ingredientes adicionales con modificadores de precio
- **Pedidos en tiempo real**: La cocina ve los pedidos instantáneamente via Socket.io
- **Gestión de estados**: Seguimiento completo del pedido (pendiente -> confirmado -> preparando -> listo -> entregado)
- **Interfaz de cocina**: Panel dedicado para el personal de cocina
- **Caja y pagos**: Procesamiento de pagos con efectivo, tarjeta y transferencia. Control de ingresos diarios
- **Administrador de menú**: CRUD completo para gestionar items del menú (solo admin)
- **Autenticación**: Sistema de login con 4 roles (admin, kitchen, waiter, cashier)
- **Diseño responsive**: Funciona en móviles y tablets

## Stack Tecnológico

### Backend
- **Node.js** + **Express**: Servidor y API REST
- **MongoDB** + **Mongoose**: Base de datos NoSQL
- **Socket.io**: Comunicación en tiempo real
- **JWT**: Autenticación
- **bcryptjs**: Encriptación de contraseñas

### Frontend
- **React** + **TypeScript**: Framework frontend
- **Material-UI**: Biblioteca de componentes
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **Socket.io-client**: Cliente de tiempo real

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd cafe-menu-app
   ```

2. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configurar variables de entorno**
   
   Copiar `.env` y configurar:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cafe-menu
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

5. **Poblar la base de datos**
   ```bash
   node server/seed.js
   ```

6. **Iniciar la aplicación**
   
   Modo desarrollo (ambos servidores):
   ```bash
   npm run dev
   ```
   
   O iniciar por separado:
   ```bash
   # Backend
   npm run server
   
   # Frontend (en otra terminal)
   npm run client
   ```

## Uso

### Acceso a la aplicación

1. **Menú / Mesero**: http://localhost:3000/menu
2. **Vista de cocina**: http://localhost:3000/kitchen
3. **Caja**: http://localhost:3000/cashier
4. **Administrador de menú**: http://localhost:3000/menu-manager (solo admin)
5. **Login**: http://localhost:3000/login

### Cuentas de demostración

- **Administrador**: admin@cafe.com / admin123
- **Cocina**: kitchen@cafe.com / kitchen123
- **Mesero**: mesero@cafe.com / mesero123
- **Caja**: caja@cafe.com / caja123

### Flujo de trabajo

1. **Mesero/Cliente**: 
   - Navega por el menú
   - Personaliza los productos
   - Agrega al carrito
   - Confirma el pedido (nombre, tipo de pedido, mesa, notas)

2. **Cocina**:
   - Recibe notificaciones en tiempo real
   - Ve los pedidos nuevos
   - Confirma y avanza el estado de preparación
   - Marca como listo para entrega

3. **Caja**:
   - Recibe pedidos listos para pagar
   - Procesa el pago (efectivo, tarjeta, transferencia)
   - Calcula cambio en efectivo
   - Controla ingresos del día

## API Endpoints

### Menú
- `GET /api/menu` - Obtener todos los items
- `GET /api/menu/:id` - Obtener item específico
- `GET /api/menu/categories/list` - Obtener categorías
- `POST /api/menu` - Crear item (admin) 🔒
- `PUT /api/menu/:id` - Actualizar item (admin) 🔒
- `DELETE /api/menu/:id` - Eliminar item (admin) 🔒

### Pedidos
- `GET /api/orders` - Obtener todos los pedidos
- `GET /api/orders/:id` - Obtener pedido específico
- `POST /api/orders` - Crear nuevo pedido
- `PATCH /api/orders/:id/status` - Actualizar estado 🔒
- `PATCH /api/orders/:id/cancel` - Cancelar pedido 🔒
- `PUT /api/orders/:id` - Editar pedido (solo pendientes) 🔒
- `DELETE /api/orders/:id` - Eliminar pedido (solo pendientes) 🔒

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

> 🔒 Requiere header `Authorization: Bearer <token>`

## Estructura del Proyecto

```
cafe-menu-app/
|-- server/
|   |-- models/
|   |   |-- MenuItem.js
|   |   |-- Order.js
|   |-- routes/
|   |   |-- menu.js
|   |   |-- orders.js
|   |   |-- auth.js
|   |-- middleware/
|   |   |-- auth.js
|   |-- index.js
|   |-- seed.js
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- CustomerMenu.tsx
|   |   |   |-- KitchenView.tsx
|   |   |   |-- CashierView.tsx
|   |   |   |-- MenuManager.tsx
|   |   |   |-- Login.tsx
|   |   |   |-- Navigation.tsx
|   |   |-- App.tsx
|   |   |-- index.tsx
|   |-- public/
|   |-- package.json
|-- package.json
|-- .env
|-- README.md
```

## Características Técnicas

### Base de Datos
- **MenuItem**: Productos del menú con opciones de personalización y tiempo de preparación
- **Order**: Pedidos con estado, items personalizados, número de orden auto-generado y timestamps

### Tiempo Real
- Socket.io para comunicación instantánea
- Notificaciones de nuevos pedidos (a todos los clientes conectados)
- Actualizaciones de estado en vivo
- Eventos: `new-order`, `order-status-update`, `order-cancelled`, `order-updated`, `order-deleted`

### Autenticación y Autorización
- JWT para autenticación
- Middleware `authenticate` para verificar token en rutas protegidas
- Middleware `requireRole` para control de acceso por rol
- Rutas de lectura (GET) son públicas
- Rutas de escritura (POST, PUT, DELETE, PATCH) requieren autenticación

### Seguridad
- JWT para autenticación
- bcryptjs para passwords
- Middleware de autenticación con verificación de token
- Control de acceso por roles (admin, kitchen, waiter, cashier)
- Validación de inputs con express-validator
- Rate limiting (100 req/15 min)
- CORS configurado
- Helmet para headers de seguridad

### UX/UI
- Material-UI para diseño consistente
- Tema personalizado con estética Patagónia/Bosque
- Layout responsive
- Indicadores de carga y estado
- Diálogos de personalización y confirmación

## Despliegue

### Producción

- **Backend**: Desplegado en Render (`render.yaml` incluido)
- **Frontend**: Desplegado en Vercel (`vercel.json` incluido)

### Desarrollo

```bash
npm run dev  # Inicia backend (port 5000) y frontend (port 3000)
```

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server/index.js"]
```

## Contribuir

1. Fork del repositorio
2. Feature branch: `git checkout -b feature/new-feature`
3. Commit: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Pull Request

## Licencia

MIT License
