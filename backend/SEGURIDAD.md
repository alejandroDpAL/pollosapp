# Seguridad Implementada en el Backend 

##  Medidas de Seguridad Activadas

### 1. **Helmet** - Protección de Headers HTTP
- Protege contra XSS, clickjacking, y otras vulnerabilidades web
- Configura headers HTTP seguros automáticamente

### 2. **Express Rate Limit** - Límite de Peticiones
- **General**: 100 peticiones cada 15 minutos por IP
- **Login**: Solo 5 intentos de login cada 15 minutos
- Previene ataques de fuerza bruta y DoS

### 3. **HPP** - HTTP Parameter Pollution
- Previene ataques de contaminación de parámetros

### 4. **CORS Configurado**
- Solo permite orígenes específicos (ya no `origin: '*'`)
- Permite aplicaciones móviles sin origin
- Soporta credenciales y headers de autorización

### 5. **JWT (JSON Web Tokens)** - Autenticación
- Tokens seguros para autenticación
- Expiración configurable (20h por defecto)
- Refresh tokens para renovar sesiones

---

##  Uso de Autenticación JWT

### 1. Login (Obtener Token)

**Endpoint:** `POST http://localhost:3000/auth/authLogin`

**Body:**
```json
{
  "user": "usuario@ejemplo.com",
  "password": "tu_contraseña"
}
```

**Respuesta Exitosa:**
```json
{
  "message": "Autenticación exitosa",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "correo": "usuario@ejemplo.com"
  }
}
```

### 2. Usar el Token en Peticiones Protegidas

Para acceder a rutas protegidas, debes incluir el token en el header `Authorization`:

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo con fetch/axios:**
```javascript
// Con fetch
fetch('http://localhost:3000/usuario/listar', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// Con axios
axios.get('http://localhost:3000/usuario/listar', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 3. Rutas Protegidas

Todas estas rutas ahora requieren el token JWT:

- `/usuario/*` - Gestión de usuarios
- `/producto/*` - Gestión de productos
- `/cliente/*` - Gestión de clientes
- `/ventas/*` - Gestión de ventas
- `/costos/*` - Gestión de costos
- `/lote/*` - Gestión de lotes
- `/perdida/*` - Gestión de pérdidas
- `/reporte-lote/*` - Reportes de lotes
- `/negocio/*` - Tipos de negocio

### 4. Rutas Públicas (No requieren token)

- `/auth/authLogin` - Login

---

##  Integración con React Native

En tu aplicación móvil, guarda el token después del login:

```javascript
// Login
const login = async (email, password) => {
  try {
    const response = await fetch('http://TU_IP:3000/auth/authLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      return data;
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};

// Usar en peticiones
const fetchData = async () => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch('http://TU_IP:3000/usuario/listar', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

##  Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_PORT=3306
DB_DATABASE=pollos

# JWT
AUTH_SECRET=esunsecretoentumirada
AUTH_EXPIRE=20h

# Servidor
PORT=3000
```

### Orígenes Permitidos en CORS

Edita en `index.js` para agregar tus dominios:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006', // Expo
    'http://192.168.1.100:19006', // Tu IP local
    'https://tu-dominio-produccion.com' // Producción
];
```

---

##  Manejo de Errores

### Respuestas de Error Comunes

**401 - No autorizado:**
```json
{
  "message": "Acceso denegado. Token no proporcionado"
}
```

**401 - Token expirado:**
```json
{
  "message": "Token expirado"
}
```

**401 - Token inválido:**
```json
{
  "message": "Token inválido"
}
```

**429 - Demasiadas peticiones:**
```json
{
  "message": "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde"
}
```

**403 - CORS:**
```json
{
  "message": "Acceso no permitido"
}
```

---

##  Archivos Creados/Modificados

### Nuevos Archivos:
- `src/middleware/auth.middleware.js` - Middleware de verificación JWT
- `src/utils/jwt.util.js` - Utilidades para generar tokens

### Archivos Modificados:
- `index.js` - Seguridad general y configuración
- `src/controllers/controler.auth.js` - Generación de tokens en login
- `src/routes/*.js` - Protección con middleware JWT
- `src/env/.env` - Variable PORT agregada

---

##  Probando la Seguridad

### Con Postman o Thunder Client:

1. **Login:**
   - POST `http://localhost:3000/auth/authLogin`
   - Body: `{"user": "email@test.com", "password": "password123"}`
   - Copia el `token` de la respuesta

2. **Acceder a Ruta Protegida:**
   - GET `http://localhost:3000/usuario/listar`
   - Header: `Authorization: Bearer TU_TOKEN_AQUI`

---

##  Checklist de Seguridad

-  Helmet activado
-  Rate Limiting configurado
-  CORS restrictivo
-  JWT implementado
-  Contraseñas hasheadas con bcrypt
-  HPP activado
-  Variables de entorno protegidas
-  Manejo de errores global
-  Límite de tamaño de payload (10mb)

---

##  Próximos Pasos Recomendados

1. **Implementar refresh token endpoint** para renovar tokens expirados
2. **Agregar validación de datos** con express-validator en controladores
3. **Implementar logout** (blacklist de tokens)
4. **Agregar logs de seguridad** para auditoría
5. **Configurar HTTPS** en producción
6. **Agregar autenticación de dos factores (2FA)** si es necesario
