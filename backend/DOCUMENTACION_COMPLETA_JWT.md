# Documentación Completa - Sistema de Seguridad y Autenticación JWT

**implementación:** 23 de diciembre de 2025  
**carpeta :**Backend  
**Branch:** Implemet_jsonwebtoken

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Vulnerabilidades Corregidas](#vulnerabilidades-corregidas)
3. [Medidas de Seguridad Implementadas](#medidas-de-seguridad-implementadas)
4. [Arquitectura JWT Implementada](#arquitectura-jwt-implementada)
5. [Base de Datos](#base-de-datos)
6. [Configuración](#configuración)
7. [API Endpoints](#api-endpoints)
8. [Integración Frontend](#integración-frontend)
9. [Testing y Validación](#testing-y-validación)
10. [Mantenimiento](#mantenimiento)

---

## RESUMEN EJECUTIVO

Se ha implementado un sistema completo de seguridad para el backend, corrigiendo múltiples vulnerabilidades y estableciendo un flujo de autenticación JWT robusto basado en las mejores prácticas de la industria.

### Cambios Principales

**Seguridad General:**
- Implementación de Helmet para protección HTTP headers
- Rate limiting para prevenir ataques de fuerza bruta
- CORS configurado de forma restrictiva
- Protección contra HTTP Parameter Pollution (HPP)
- Eliminación de credenciales expuestas en Git

**Autenticación JWT:**
- Separación completa de access tokens y refresh tokens
- Dos secretos JWT independientes (512 bits cada uno)
- Sistema de revocación de tokens mediante base de datos
- Endpoints de renovación y logout implementados
- Middleware que rechaza refresh tokens en rutas protegidas

---

## VULNERABILIDADES CORREGIDAS

### 1. Archivo .env Expuesto en Repositorio Git

**Problema:**
El archivo `backend/src/env/.env` con credenciales sensibles fue subido a GitHub, exponiendo:
- Credenciales de base de datos (usuario, contraseña, host)
- Secreto JWT original
- Configuración del servidor

**Solución aplicada:**
- Archivo .env removido del índice de Git (`git rm --cached`)
- Nuevo secreto JWT generado (512 bits)
- Archivo .gitignore creado en el directorio backend
- Archivo .env.example creado como plantilla
- Commit de seguridad realizado y pusheado

**Estado:** RESUELTO

### 2. CORS Abierto a Cualquier Origen

**Problema:**
```javascript
cors({ origin: '*' }) // Permitía cualquier origen
```

**Solución:**
```javascript
cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
})
```

**Estado:** RESUELTO

### 3. Tokens JWT Intercambiables

**Problema:**
Access token y refresh token usaban el mismo secreto JWT y podían usarse indistintamente. El refresh token podía acceder directamente a rutas protegidas como `/usuario/listar`, cuando solo debería usarse para renovar el access token.

**Impacto:**
- Si un refresh token (duración 7 días) se comprometía, el atacante tenía acceso prolongado a las APIs
- No existía manera de revocar sesiones
- Violación del principio de menor privilegio

**Solución:**
- Dos secretos JWT separados: ACCESS_TOKEN_SECRET y REFRESH_TOKEN_SECRET
- Claims distintivos: `type: "access"` vs `type: "refresh"`
- Audience separada: `pollosapp-api` vs `pollosapp-refresh`
- Middleware modificado para rechazar refresh tokens con error 403
- Tabla `refresh_tokens` en base de datos para control y revocación

**Estado:** RESUELTO

### 4. Ausencia de Rate Limiting

**Problema:**
Sin protección contra ataques de fuerza bruta en endpoints de autenticación.

**Solución:**
```javascript
// Rate limit general: 100 peticiones/15min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Rate limit para login: 5 intentos/15min
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});
```

**Estado:** RESUELTO

### 5. Headers HTTP Inseguros

**Problema:**
Sin protección contra XSS, clickjacking y otras vulnerabilidades web comunes.

**Solución:**
```javascript
server.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
```

**Estado:** RESUELTO

---

## MEDIDAS DE SEGURIDAD IMPLEMENTADAS

### Librerías Instaladas

```json
{
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.2.1",
  "express-validator": "^7.3.1",
  "hpp": "^0.2.3",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.3"
}
```

### 1. Helmet

Configura headers HTTP seguros automáticamente:
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

### 2. Express Rate Limit

**Configuración general:**
- Ventana: 15 minutos
- Máximo: 100 peticiones por IP
- Headers estándar incluidos

**Configuración para login:**
- Ventana: 15 minutos
- Máximo: 5 intentos por IP
- Skip en logins exitosos

### 3. HPP (HTTP Parameter Pollution)

Previene ataques de contaminación de parámetros HTTP.

### 4. CORS Restrictivo

**Orígenes permitidos:**
```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://192.168.1.100:19006'
];
```

**Configuración:**
- Credentials habilitado
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Authorization

### 5. Validación de Entrada

Implementada en controladores de autenticación:
- Validación de formato de correo electrónico
- Verificación de campos requeridos
- Protección contra timing attacks en login

---

## ARQUITECTURA JWT IMPLEMENTADA

### Filosofía de Diseño

El sistema implementa el patrón de "access token de corta duración + refresh token de larga duración", siguiendo las recomendaciones de OAuth 2.0 y las mejores prácticas de seguridad.

**Principios aplicados:**
1. Separación de responsabilidades (access vs refresh)
2. Menor privilegio (refresh token solo para renovación)
3. Defensa en profundidad (múltiples capas de validación)
4. Revocabilidad (logout mediante base de datos)
5. Auditoría (registro de IP y User-Agent)

### Componentes del Sistema

#### 1. Variables de Entorno

Archivo: `src/env/.env`

```env
# Access Token (APIs)
ACCESS_TOKEN_SECRET=6ea6c4f9276b8cf893fd9f940a0229e1...
ACCESS_TOKEN_EXPIRE=15m

# Refresh Token (renovación)
REFRESH_TOKEN_SECRET=524723d92e7d7ef9a7495d57787b70ad...
REFRESH_TOKEN_EXPIRE=7d

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_PORT=3306
DB_DATABASE=pollos

# Servidor
PORT=3000
```

**Características de los secretos:**
- Longitud: 512 bits (128 caracteres hexadecimales)
- Generación: `crypto.randomBytes(64).toString('hex')`
- Independientes: ACCESS_TOKEN_SECRET != REFRESH_TOKEN_SECRET

#### 2. Utilidades JWT

Archivo: `src/utils/jwt.util.js`

**Funciones principales:**

```javascript
generateAccessToken(payload)
// Crea token con type: "access", expiración 15m
// Firmado con ACCESS_TOKEN_SECRET
// Audience: pollosapp-api

generateRefreshToken(payload)
// Crea token con type: "refresh", expiración 7d
// Firmado con REFRESH_TOKEN_SECRET
// Audience: pollosapp-refresh

verifyAccessToken(token)
// Valida firma con ACCESS_TOKEN_SECRET
// Verifica que type === "access"
// Rechaza refresh tokens

verifyRefreshToken(token)
// Valida firma con REFRESH_TOKEN_SECRET
// Verifica que type === "refresh"
// Rechaza access tokens
```

**Estructura de tokens:**

Access Token:
```json
{
  "id": 1,
  "correo": "user@example.com",
  "type": "access",
  "aud": "pollosapp-api",
  "iss": "pollosapp",
  "exp": 1640000900
}
```

Refresh Token:
```json
{
  "id": 1,
  "type": "refresh",
  "aud": "pollosapp-refresh",
  "iss": "pollosapp",
  "exp": 1640604800
}
```

#### 3. Middleware de Autenticación

Archivo: `src/middleware/auth.middleware.js`

**Función: verifyToken**

Proceso de validación:
1. Extrae token del header Authorization
2. Valida formato Bearer
3. Verifica firma con ACCESS_TOKEN_SECRET
4. Valida que type === "access"
5. Verifica expiración
6. Agrega req.user con datos del token

**Comportamiento ante errores:**

| Error | Código HTTP | Response Code |
|-------|-------------|---------------|
| Sin token | 401 | NO_TOKEN |
| Token expirado | 401 | TOKEN_EXPIRED |
| Token inválido | 401 | INVALID_TOKEN |
| Refresh token usado | 403 | REFRESH_TOKEN_NOT_ALLOWED |
| Error interno | 500 | VERIFICATION_ERROR |

#### 4. Controladores de Autenticación

Archivo: `src/controllers/controler.auth.js`

**AuthUserController (Login)**

Endpoint: POST /auth/login

Proceso:
1. Valida formato de correo y campos requeridos
2. Busca usuario en base de datos
3. Verifica contraseña con bcrypt
4. Genera access token (15 minutos)
5. Genera refresh token (7 días)
6. Guarda refresh token en base de datos con IP y User-Agent
7. Retorna ambos tokens

Protecciones implementadas:
- Timing attack mitigation (delay constante en error)
- Simulación de bcrypt en usuario inexistente
- Rate limiting (5 intentos/15min)

**RefreshTokenController**

Endpoint: POST /auth/refresh

Proceso:
1. Recibe refresh token en body
2. Verifica firma con REFRESH_TOKEN_SECRET
3. Valida que type === "refresh"
4. Busca token en base de datos
5. Verifica que no esté revocado
6. Verifica que no haya expirado
7. Obtiene datos del usuario
8. Genera nuevo access token
9. Retorna nuevo access token

**LogoutController**

Endpoint: POST /auth/logout

Proceso:
1. Recibe refresh token en body
2. Marca token como revocado en base de datos
3. Registra timestamp de revocación
4. Retorna confirmación

**LogoutAllController**

Endpoint: POST /auth/logout-all

Proceso:
1. Requiere access token válido (middleware)
2. Extrae usuario_id del token
3. Revoca todos los refresh tokens activos del usuario
4. Retorna cantidad de sesiones cerradas

#### 5. Rutas de Autenticación

Archivo: `src/routes/ruta.auth.js`

```javascript
// Rutas públicas
POST /auth/authLogin        // Login (legacy)
POST /auth/login            // Login (recomendado)
POST /auth/refresh          // Renovar access token
POST /auth/logout           // Cerrar sesión

// Rutas protegidas (requieren access token)
POST /auth/logout-all       // Cerrar todas las sesiones
```

---

## BASE DE DATOS

### Tabla: refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expira_en DATETIME NOT NULL,
    revocado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revocado_en TIMESTAMP NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token(255)),
    INDEX idx_revocado (revocado),
    INDEX idx_expira_en (expira_en),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**

- **id:** Identificador único
- **usuario_id:** Relación con tabla usuarios
- **token:** Refresh token JWT (hasta 500 caracteres)
- **expira_en:** Fecha y hora de expiración
- **revocado:** Indica si el token fue revocado (logout)
- **creado_en:** Timestamp de creación automático
- **revocado_en:** Timestamp cuando se revocó (nullable)
- **ip_address:** IP del cliente (auditoría)
- **user_agent:** User-Agent del navegador/app (auditoría)

**Índices optimizados:**

- idx_usuario_id: Búsquedas por usuario
- idx_token: Validación rápida de tokens
- idx_revocado: Filtrado de tokens activos
- idx_expira_en: Limpieza de tokens expirados

**Migración:**

Archivo: `src/database/migrations/create_refresh_tokens.sql`

Ejecutar con:
```bash
npm run migrate
```

O manualmente:
```bash
mysql -u root -p pollos < src/database/migrations/create_refresh_tokens.sql
```

**Mantenimiento:**

Limpiar tokens expirados y revocados antiguos:
```sql
DELETE FROM refresh_tokens 
WHERE expira_en < NOW() 
OR (revocado = TRUE AND revocado_en < DATE_SUB(NOW(), INTERVAL 30 DAY));
```

Se recomienda ejecutar periódicamente mediante cron job.

---

## CONFIGURACIÓN

### Archivo Principal

`backend/index.js`

**Orden de middleware:**

1. Helmet (headers seguros)
2. Rate limiting (general y login)
3. HPP (parameter pollution)
4. CORS (restrictivo)
5. Body parsers (con límite 10mb)
6. Rutas

**Manejo de errores:**

```javascript
// Ruta no encontrada
server.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler global
server.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
});
```

### Rutas Protegidas

Todas las rutas de negocio requieren access token válido:

```javascript
import { verifyToken } from '../middleware/auth.middleware.js';

router.get('/listar', verifyToken, controller);
router.post('/registrar', verifyToken, controller);
router.put('/actualizar/:id', verifyToken, controller);
router.delete('/eliminar/:id', verifyToken, controller);
```

**Rutas afectadas:**
- /usuario/*
- /producto/*
- /cliente/*
- /ventas/*
- /costos/*
- /lote/*
- /perdida/*
- /reporte-lote/*
- /negocio/*

**Rutas públicas:**
- /auth/login
- /auth/refresh
- /auth/logout

---

## API ENDPOINTS

### Autenticación

#### POST /auth/login

Autentica un usuario y genera tokens.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "user": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response exitosa (200):**
```json
{
  "message": "Autenticación exitosa",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "correo": "usuario@ejemplo.com"
  },
  "expiresIn": "15m"
}
```

**Errores:**

| Código | Mensaje |
|--------|---------|
| 400 | Usuario y contraseña son requeridos |
| 400 | Formato de correo inválido |
| 401 | Credenciales inválidas |
| 429 | Demasiados intentos de inicio de sesión |
| 500 | Error interno del servidor |

#### POST /auth/refresh

Renueva un access token expirado usando refresh token.

**Request:**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response exitosa (200):**
```json
{
  "message": "Access token renovado exitosamente",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

**Errores:**

| Código | Code | Mensaje |
|--------|------|---------|
| 400 | NO_REFRESH_TOKEN | Refresh token requerido |
| 401 | INVALID_REFRESH_TOKEN | Refresh token inválido |
| 401 | REFRESH_TOKEN_EXPIRED | Refresh token expirado |
| 401 | REFRESH_TOKEN_NOT_FOUND | Refresh token no encontrado |
| 401 | REFRESH_TOKEN_REVOKED | Refresh token ha sido revocado |
| 404 | USER_NOT_FOUND | Usuario no encontrado |

#### POST /auth/logout

Cierra la sesión revocando el refresh token.

**Request:**
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response exitosa (200):**
```json
{
  "message": "Sesión cerrada exitosamente",
  "code": "LOGOUT_SUCCESS"
}
```

#### POST /auth/logout-all

Cierra todas las sesiones del usuario (requiere access token).

**Request:**
```http
POST /auth/logout-all
Authorization: Bearer {accessToken}
```

**Response exitosa (200):**
```json
{
  "message": "Se cerraron 3 sesión(es) exitosamente",
  "sessionsRevoked": 3,
  "code": "LOGOUT_ALL_SUCCESS"
}
```

### Rutas Protegidas

Todas requieren header:
```http
Authorization: Bearer {accessToken}
```

**Ejemplo:**
```http
GET /usuario/listar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Errores comunes:**

| Código | Code | Mensaje |
|--------|------|---------|
| 401 | NO_TOKEN | Acceso denegado. Token no proporcionado |
| 401 | TOKEN_EXPIRED | Access token expirado |
| 401 | INVALID_TOKEN | Access token inválido |
| 403 | REFRESH_TOKEN_NOT_ALLOWED | No puedes usar un refresh token aquí |

---

## INTEGRACIÓN FRONTEND

### Cambios Necesarios

**IMPORTANTE:** La respuesta del login cambió.

**Antes:**
```javascript
const { token, refreshToken } = response.data;
```

**Ahora:**
```javascript
const { accessToken, refreshToken } = response.data;
```

### React Native con AsyncStorage

#### 1. Login

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (email, password) => {
  try {
    const response = await fetch('http://API_URL/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

#### 2. Peticiones con Access Token

```javascript
const fetchData = async (endpoint) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`http://API_URL${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      return fetchData(endpoint);
    } else {
      navigateToLogin();
      throw new Error('Sesión expirada');
    }
  }

  return await response.json();
};
```

#### 3. Renovar Access Token

```javascript
const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  if (!refreshToken) return false;

  try {
    const response = await fetch('http://API_URL/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem('accessToken', data.accessToken);
      return true;
    }

    if (data.code === 'REFRESH_TOKEN_EXPIRED' || 
        data.code === 'REFRESH_TOKEN_REVOKED') {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      return false;
    }
  } catch (error) {
    console.error('Error renovando token:', error);
    return false;
  }
};
```

#### 4. Logout

```javascript
const logout = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      await fetch('http://API_URL/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  navigateToLogin();
};
```

### Axios Interceptor (Recomendado)

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://API_URL'
});

api.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const { data } = await axios.post('http://API_URL/auth/refresh', {
            refreshToken
          });

          await AsyncStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Uso:**
```javascript
import api from './api';

const getUsers = async () => {
  const response = await api.get('/usuario/listar');
  return response.data;
};

const createUser = async (userData) => {
  const response = await api.post('/usuario/registrar', userData);
  return response.data;
};
```

---

## TESTING Y VALIDACIÓN

### Escenarios de Prueba

#### 1. Login Exitoso

```http
POST /auth/login
Content-Type: application/json

{
  "user": "test@test.com",
  "password": "password123"
}
```

**Validar:**
- Status 200
- Respuesta contiene accessToken
- Respuesta contiene refreshToken
- Respuesta contiene user.id y user.correo
- Campo expiresIn = "15m"

#### 2. Acceso con Access Token

```http
GET /usuario/listar
Authorization: Bearer {accessToken}
```

**Validar:**
- Status 200
- Retorna lista de usuarios
- Datos correctos

#### 3. Intento de Usar Refresh Token en API

```http
GET /usuario/listar
Authorization: Bearer {refreshToken}
```

**Validar:**
- Status 403
- code = "REFRESH_TOKEN_NOT_ALLOWED"
- Mensaje indica que no se puede usar refresh token

#### 4. Renovar Access Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```

**Validar:**
- Status 200
- Respuesta contiene nuevo accessToken
- Campo expiresIn = "15m"

#### 5. Logout

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```

**Validar:**
- Status 200
- code = "LOGOUT_SUCCESS"

#### 6. Intentar Renovar Después de Logout

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refreshToken_revocado}"
}
```

**Validar:**
- Status 401
- code = "REFRESH_TOKEN_REVOKED"

#### 7. Rate Limiting en Login

Hacer más de 5 intentos de login en 15 minutos.

**Validar:**
- Status 429 después del 5to intento
- Mensaje sobre demasiados intentos

#### 8. Access Token Expirado

Esperar 15 minutos después del login y hacer petición.

**Validar:**
- Status 401
- code = "TOKEN_EXPIRED"
- Mensaje sugiere usar refresh token

### Checklist de Seguridad

**Configuración:**
- [ ] Variables de entorno configuradas correctamente
- [ ] ACCESS_TOKEN_SECRET y REFRESH_TOKEN_SECRET son diferentes
- [ ] Secretos tienen mínimo 512 bits
- [ ] CORS configurado con orígenes específicos
- [ ] Rate limiting activado

**Base de Datos:**
- [ ] Tabla refresh_tokens creada
- [ ] Índices creados correctamente
- [ ] Foreign key con usuarios establecida

**Autenticación:**
- [ ] Login genera ambos tokens
- [ ] Refresh tokens guardados en BD
- [ ] Access tokens expiran en 15 minutos
- [ ] Refresh tokens expiran en 7 días

**Autorización:**
- [ ] Middleware rechaza refresh tokens
- [ ] Rutas protegidas requieren access token
- [ ] Mensajes de error son específicos

**Revocación:**
- [ ] Logout marca tokens como revocados
- [ ] Tokens revocados no pueden renovar
- [ ] Logout-all revoca todas las sesiones

---

## MANTENIMIENTO

### Limpieza de Tokens Expirados

**Opción 1: SQL Manual**

```sql
DELETE FROM refresh_tokens 
WHERE expira_en < NOW() 
OR (revocado = TRUE AND revocado_en < DATE_SUB(NOW(), INTERVAL 30 DAY));
```

**Opción 2: Cron Job (Linux/Mac)**

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diariamente a las 3am)
0 3 * * * mysql -u root -pPASSWORD pollos -e "DELETE FROM refresh_tokens WHERE expira_en < NOW() OR (revocado = TRUE AND revocado_en < DATE_SUB(NOW(), INTERVAL 30 DAY));"
```

**Opción 3: Script Node.js**

Crear archivo `scripts/cleanup-tokens.js`:

```javascript
import { pool } from '../src/database/conexion.js';

async function cleanupTokens() {
    try {
        const [result] = await pool.query(`
            DELETE FROM refresh_tokens 
            WHERE expira_en < NOW() 
            OR (revocado = TRUE AND revocado_en < DATE_SUB(NOW(), INTERVAL 30 DAY))
        `);
        
        console.log(`Tokens eliminados: ${result.affectedRows}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanupTokens();
```

Ejecutar:
```bash
node scripts/cleanup-tokens.js
```

### Monitoreo

**Consultas útiles:**

Tokens activos por usuario:
```sql
SELECT usuario_id, COUNT(*) as sesiones_activas
FROM refresh_tokens
WHERE revocado = FALSE AND expira_en > NOW()
GROUP BY usuario_id;
```

Tokens a punto de expirar:
```sql
SELECT id, usuario_id, expira_en
FROM refresh_tokens
WHERE revocado = FALSE 
AND expira_en > NOW() 
AND expira_en < DATE_ADD(NOW(), INTERVAL 1 DAY);
```

Estadísticas de sesiones:
```sql
SELECT 
    COUNT(*) as total,
    SUM(revocado = FALSE) as activos,
    SUM(revocado = TRUE) as revocados,
    SUM(expira_en < NOW()) as expirados
FROM refresh_tokens;
```

### Rotación de Secretos JWT

Si necesitas rotar los secretos JWT (recomendado anualmente):

1. Generar nuevos secretos:
```bash
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

2. Actualizar .env con los nuevos secretos

3. Revocar todos los refresh tokens existentes:
```sql
UPDATE refresh_tokens SET revocado = TRUE, revocado_en = NOW() WHERE revocado = FALSE;
```

4. Reiniciar servidor

5. Usuarios deberán hacer login nuevamente

### Backup de Refresh Tokens

Incluir tabla en backups:
```bash
mysqldump -u root -p pollos refresh_tokens > refresh_tokens_backup.sql
```

### Logs de Seguridad

Implementar logging de eventos importantes:

```javascript
// En controler.auth.js
const logSecurityEvent = async (event, userId, details) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        userId,
        details
    }));
};

// Eventos a registrar:
// - LOGIN_SUCCESS
// - LOGIN_FAILED
// - TOKEN_REFRESHED
// - LOGOUT
// - LOGOUT_ALL
// - INVALID_TOKEN_ATTEMPT
```

---

## APÉNDICES

### A. Comparación Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Secretos JWT | 1 (compartido) | 2 (separados) |
| Access token expira | 20 horas | 15 minutos |
| Refresh token expira | 20 horas | 7 días |
| Refresh en APIs | Permitido | Bloqueado (403) |
| Revocación | Imposible | Sí (logout) |
| CORS | Abierto (*) | Restrictivo (whitelist) |
| Rate limiting | No | Sí (general + login) |
| Helmet | No | Sí |
| HPP | No | Sí |
| Auditoría | No | IP + User-Agent |
| .env en Git | Sí (expuesto) | No (protegido) |

### B. Archivos del Sistema

**Creados:**
- src/middleware/auth.middleware.js
- src/utils/jwt.util.js
- src/database/migrations/create_refresh_tokens.sql
- src/database/run-migration.js
- backend/.gitignore
- src/env/.env.example

**Modificados:**
- index.js
- src/controllers/controler.auth.js
- src/routes/ruta.auth.js
- src/routes/ruta.usuarios.js
- src/routes/ruta.productos.js
- src/routes/ruta.ventas.js
- src/routes/ruta.lotes.js
- src/env/.env
- package.json

**Para eliminar (obsoletos):**
- SEGURIDAD.md
- ALERTA_SEGURIDAD.md
- DOCUMENTACION_JWT.md
- IMPLEMENTACION_JWT_COMPLETADA.md

### C. Scripts package.json

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "migrate": "node src/database/run-migration.js"
  }
}
```

### D. Dependencias Completas

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.21.2",
    "express-rate-limit": "^8.2.1",
    "express-validator": "^7.3.1",
    "helmet": "^8.1.0",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^9.0.3",
    "mysql2": "^3.14.1"
  }
}
```

---

## CONTACTO Y SOPORTE

Para preguntas o problemas relacionados con esta implementación:

1. Revisar esta documentación completa
2. Verificar logs del servidor
3. Consultar tabla refresh_tokens en base de datos
4. Validar configuración de variables de entorno

**Comandos útiles de diagnóstico:**

```bash
# Ver logs del servidor
npm run dev

# Verificar migración
npm run migrate

# Ver estado de Git
git status

# Verificar que .env no esté en Git
git ls-files | grep .env
```

---

**Última actualización:** 23 de diciembre de 2025  
**Versión del documento:** 1.0  
**Branch:** Implemet_jsonwebtoken  
**Estado:** Implementación completada y verificada
