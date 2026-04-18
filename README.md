# Café Menu App

Aplicación completa de menú de café con pedidos en tiempo real.

## Características

- **Menú interactivo**: Clientes pueden ver productos, personalizarlos y agregar al carrito
- **Personalización avanzada**: Opciones de tamaño, sabor, ingredientes adicionales
- **Pedidos en tiempo real**: La cocina ve los pedidos instantáneamente
- **Gestión de estados**: Seguimiento completo del pedido (pendiente -> confirmado -> preparando -> listo -> entregado)
- **Interfaz de cocina**: Panel dedicado para el personal de cocina
- **Autenticación**: Sistema de login para diferentes roles
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

1. **Menú para clientes**: http://localhost:3000/menu
2. **Vista de cocina**: http://localhost:3000/kitchen
3. **Login**: http://localhost:3000/login

### Cuentas de demostración

- **Administrador**: admin@cafe.com / admin123
- **Cocina**: kitchen@cafe.com / kitchen123

### Flujo de trabajo

1. **Cliente**: 
   - Navega por el menú
   - Personaliza los productos
   - Agrega al carrito
   - Confirma el pedido

2. **Cocina**:
   - Recibe notificaciones en tiempo real
   - Ve los pedidos nuevos
   - Actualiza el estado de preparación
   - Marca como listo para entrega

## API Endpoints

### Menú
- `GET /api/menu` - Obtener todos los items
- `GET /api/menu/:id` - Obtener item específico
- `GET /api/menu/categories/list` - Obtener categorías
- `POST /api/menu` - Crear item (admin)
- `PUT /api/menu/:id` - Actualizar item (admin)
- `DELETE /api/menu/:id` - Eliminar item (admin)

### Pedidos
- `GET /api/orders` - Obtener todos los pedidos
- `GET /api/orders/:id` - Obtener pedido específico
- `POST /api/orders` - Crear nuevo pedido
- `PATCH /api/orders/:id/status` - Actualizar estado
- `PATCH /api/orders/:id/cancel` - Cancelar pedido

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

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
|   |-- index.js
|   |-- seed.js
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- CustomerMenu.tsx
|   |   |   |-- KitchenView.tsx
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
- **MenuItem**: Productos del menú con opciones de personalización
- **Order**: Pedidos con estado, items personalizados y timestamps

### Tiempo Real
- Socket.io para comunicación instantánea
- Notificaciones de nuevos pedidos
- Actualizaciones de estado en vivo

### Seguridad
- JWT para autenticación
- bcryptjs para passwords
- Validación de inputs
- CORS configurado

### UX/UI
- Material-UI para diseño consistente
- Tema personalizado con colores café
- Layout responsive
- Indicadores de carga y estado

## Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Construir frontend: `npm run build`
3. Usar PM2 o similar para el backend
4. Configurar Nginx como proxy reverso

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
