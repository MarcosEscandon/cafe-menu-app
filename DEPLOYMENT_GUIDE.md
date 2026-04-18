# Guía de Despliegue GRATUITA - Café Bosque

## Resumen
Despliega tu aplicación MERN (React + Node.js + MongoDB) completamente GRATIS usando:
- **Frontend**: Vercel
- **Backend**: Render  
- **Database**: MongoDB Atlas

---

## Paso 1: MongoDB Atlas (5 minutos)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Regístrate con cuenta gratuita
3. Crea un nuevo cluster:
   - Nombre: `cafe-bosque-cluster`
   - Provider: AWS
   - Region: más cercana a tu ubicación
   - Cluster Tier: M0 (Gratis)
4. Crea usuario de base de datos:
   - Username: `cafeuser`
   - Password: `cafe123secure`
5. Configura IP Whitelist:
   - Añade `0.0.0.0/0` (permite todas las IPs)
6. Obtén tu connection string:
   ```
   mongodb+srv://cafeuser:cafe123secure@cluster0.xxxxx.mongodb.net/cafe-menu?retryWrites=true&w=majority
   ```

---

## Paso 2: GitHub (2 minutos)

1. Crea un nuevo repositorio: `cafe-menu-app`
2. Sube tu código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Café Bosque"
   git remote add origin https://github.com/TU_USERNAME/cafe-menu-app.git
   git push -u origin main
   ```

---

## Paso 3: Backend - Render (5 minutos)

1. Ve a [Render](https://render.com/)
2. Regístrate con GitHub
3. Crea nuevo "Web Service":
   - Connect GitHub repo: `cafe-menu-app`
   - Name: `cafe-bosque-api`
   - Root Directory: `server`
   - Build Command: `cd .. && npm install && cd server && npm install`
   - Start Command: `cd .. && npm run server`
4. Configura Environment Variables:
   - `MONGODB_URI`: Tu connection string de MongoDB Atlas
   - `JWT_SECRET`: `cafe_bosque_jwt_secret_production_2024_ultra_secure`
   - `NODE_ENV`: `production`
5. Click "Create Web Service"
6. Espera el deploy y obtén tu URL: `https://cafe-bosque-api.onrender.com`

---

## Paso 4: Frontend - Vercel (3 minutos)

1. Ve a [Vercel](https://vercel.com/)
2. Regístrate con GitHub
3. Importa tu repositorio: `cafe-menu-app`
4. Configura:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Configura Environment Variables:
   - `REACT_APP_API_URL`: Tu URL de Render
6. Click "Deploy"
7. Obtén tu URL: `https://cafe-bosque.vercel.app`

---

## Paso 5: Poblar Base de Datos (2 minutos)

1. Una vez que el backend esté funcionando en Render:
2. Visita: `https://cafe-bosque-api.onrender.com/server/seed.js`
3. O usa cURL:
   ```bash
   curl https://cafe-bosque-api.onrender.com/api/menu/seed
   ```

---

## Paso 6: Probar la Aplicación

1. **Frontend**: `https://cafe-bosque.vercel.app`
2. **Backend API**: `https://cafe-bosque-api.onrender.com/api/menu`
3. **Login**: `admin@cafe.com / admin123`

---

## URLs Finales

- **Mesero**: `https://cafe-bosque.vercel.app/menu`
- **Cocina**: `https://cafe-bosque.vercel.app/kitchen`
- **Caja**: `https://cafe-bosque.vercel.app/cashier`
- **API**: `https://cafe-bosque-api.onrender.com/api`

---

## Costo Total: $0/mes

- **Vercel**: $0 (100GB bandwidth)
- **Render**: $0 (750 horas/mes)
- **MongoDB Atlas**: $0 (512MB storage)

---

## Troubleshooting

### Si el frontend no carga:
- Revisa que `REACT_APP_API_URL` sea correcta
- Espera 2-3 minutos (Render puede tener cold start)

### Si Socket.io no funciona:
- Render soporta websockets en planes gratis
- Revisa que el backend esté corriendo

### Si MongoDB no conecta:
- Verifica IP whitelist en MongoDB Atlas
- Revisa connection string
- Espera 2-3 minutos después de crear cluster

---

## Soporte

Si tienes problemas:
1. Revisa los logs en Render dashboard
2. Revisa los logs en Vercel dashboard  
3. Verifica environment variables
4. Asegúrate que MongoDB Atlas esté activo

¡Listo! Tu Café Bosque está online y GRATIS.
