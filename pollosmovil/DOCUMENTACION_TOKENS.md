#  Sistema de Autenticación con Tokens JWT

## Índice
- [Descripción General](#descripción-general)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Estructura de Archivos](#estructura-de-archivos)
- [Cómo Funciona](#cómo-funciona)
- [Uso en Componentes](#uso-en-componentes)
- [Renovación Automática](#renovación-automática)
- [Manejo de Errores](#manejo-de-errores)

---

##  Descripción General

Este proyecto implementa un sistema de autenticación seguro usando **JWT (JSON Web Tokens)** con dos tipos de tokens:

- **Access Token**: Token de corta duración (15 minutos) usado para autenticar cada petición
- **Refresh Token**: Token de larga duración (7 días) usado para obtener nuevos access tokens

### Ventajas de este Sistema
 **Seguridad mejorada**: Los access tokens expiran rápido, reduciendo riesgo de robo  
 **Experiencia fluida**: El usuario no necesita hacer login constantemente  
 **Renovación automática**: Los tokens se renuevan transparentemente  
 **Gestión centralizada**: Todo el manejo de tokens está en un solo lugar  

---

##  Flujo de Autenticación

```
┌─────────────────┐
│  Usuario hace   │
│     Login       │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│   auth.Api.js               │
│   POST /auth/authLogin      │
│   { user, password }        │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│   Backend Responde:         │
│   {                         │
│     user: { id, correo },   │
│     accessToken: "xxx",     │
│     refreshToken: "yyy"     │
│   }                         │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│   AuthContext.jsx           │
│   - Guarda tokens en        │
│     AsyncStorage            │
│   - Actualiza estado global │
│   - Marca isLoggedIn=true   │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│   Usuario Autenticado       │
│   App redirige a Home       │
└─────────────────────────────┘
```

---

##  Estructura de Archivos

```
pollosmovil/
└── src/
    ├── services/
    │   └── storageService.jsx          #  Almacenamiento local de tokens
    │
    ├── Hook/
    │   ├── context/
    │   │   └── AuthContext.jsx         #  Contexto global de autenticación
    │   │
    │   └── Api/
    │       ├── apiConnection.js        #  Configuración Axios + Interceptors
    │       ├── auth.Api.js             #  Login y autenticación
    │       ├── userApi.js              #  APIs de usuarios
    │       ├── productApi.js           #  APIs de productos
    │       └── ...                     # Otras APIs
    │
    └── pages/
        └── Auth/
            └── Login.jsx               #  Pantalla de Login
```

---

##  Cómo Funciona

###  **storageService.jsx** - Almacenamiento Local

```javascript
// Guarda ambos tokens en el dispositivo
await saveTokens(accessToken, refreshToken);

// Obtiene el access token
const token = await getAccessToken();

// Obtiene el refresh token
const refreshToken = await getRefreshToken();

// Borra todos los tokens (logout)
await clearTokens();
```

**Ubicación**: `src/services/storageService.jsx`  
**Propósito**: Persistir tokens en AsyncStorage del dispositivo

---

###  **AuthContext.jsx** - Gestor Global de Autenticación

```javascript
import { useAuth } from '../../Hook/context/AuthContext';

function MyComponent() {
  const { user, isLoggedIn, login, logout, loading } = useAuth();

  // Hacer login
  const handleLogin = async () => {
    await login({
      user: userData,
      accessToken: "xxx",
      refreshToken: "yyy"
    });
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View>
      {isLoggedIn ? <Text>Bienvenido {user.correo}</Text> : <Text>No autenticado</Text>}
    </View>
  );
}
```

**Ubicación**: `src/Hook/context/AuthContext.jsx`  
**Propósito**: 
- Mantener estado global del usuario
- Exponer funciones `login()` y `logout()`
- Restaurar sesión al abrir la app
- Compartir estado con toda la aplicación

---

###  **apiConnection.js** - Interceptor de Axios (El Corazón del Sistema)

Este archivo es **CRÍTICO**. Maneja automáticamente:

#### 🔹 Request Interceptor (Antes de cada petición)
```javascript
// Automáticamente agrega el token a TODAS las peticiones
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Resultado**: No necesitas agregar manualmente el token en cada API call

#### 🔹 Response Interceptor (Después de cada respuesta)
```javascript
// Si el token expiró (401), lo renueva automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 1. Obtiene el refresh token
      // 2. Llama a /auth/refresh
      // 3. Guarda el nuevo access token
      // 4. Reintenta la petición original
    }
    return Promise.reject(error);
  }
);
```

**Resultado**: El usuario nunca ve errores de "sesión expirada", todo se renueva solo

**Ubicación**: `src/Hook/Api/apiConnection.js`

---
### **auth.Api.js** - Función de Login

```javascript
import { loginUser } from '../../Hook/Api/auth.Api';

// En tu componente
const response = await loginUser(email, password);

if (response.success) {
  login({
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken
  });
}
```

**Ubicación**: `src/Hook/Api/auth.Api.js`  
**Endpoint Backend**: `POST /auth/authLogin`

---

## Uso en Componentes

### Ejemplo: Pantalla de Login

```jsx
import React, { useState } from 'react';
import { useAuth } from '../../Hook/context/AuthContext';
import { loginUser } from '../../Hook/Api/auth.Api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await loginUser(email, password);
      
      if (response.success) {
        // Guarda tokens y actualiza estado global
        login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
        // La app automáticamente redirige a Home
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
    </View>
  );
}
```

### Ejemplo: Usar una API Protegida

```javascript
import api from '../../Hook/Api/apiConnection';

//  CORRECTO: El token se agrega automáticamente
export const getUsuarios = async () => {
  const response = await api.get('/usuario/listar');
  return response.data;
};

//  INCORRECTO: No necesitas hacer esto
export const getUsuariosWrong = async () => {
  const token = await getAccessToken();
  const response = await api.get('/usuario/listar', {
    headers: { Authorization: `Bearer ${token}` } //  No necesario
  });
  return response.data;
};
```

**Todas las APIs en `src/Hook/Api/` usan `api` de `apiConnection.js`**, así que el token se inyecta automáticamente.

---

##  Renovación Automática de Tokens

### ¿Cuándo se Renueva?

El access token se renueva automáticamente cuando:
1. El backend responde con código **401 Unauthorized**
2. El token aún no ha sido revocado en la base de datos
3. El refresh token no ha expirado (7 días)

### Flujo de Renovación

```
Usuario hace petición → Backend responde 401
         ↓
apiConnection detecta el 401
         ↓
Pausa la petición original
         ↓
POST /auth/refresh { refreshToken }
         ↓
Backend responde con nuevo accessToken
         ↓
Guarda el nuevo token en AsyncStorage
         ↓
Reintenta la petición original con nuevo token
         ↓
Usuario recibe la respuesta SIN NOTAR NADA
```

### Código Interno (apiConnection.js)

```javascript
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  
  const refreshToken = await getRefreshToken();
  const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  const newAccessToken = res.data.accessToken;
  
  await saveTokens(newAccessToken, refreshToken);
  
  // Reintentar petición original
  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  return api(originalRequest);
}
```

---

##  Manejo de Errores

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| **401 Unauthorized** | Token expirado o inválido | Se renueva automáticamente con refresh token |
| **403 Forbidden** | Usuario no tiene permisos | Mostrar mensaje al usuario |
| **Network Error** | Sin conexión a internet | Mostrar alerta de conectividad |
| **Refresh Token Expirado** | Más de 7 días sin usar la app | Redirigir a Login |

### Ejemplo de Manejo

```javascript
try {
  const data = await getUserProfile();
} catch (error) {
  if (error.response?.status === 401) {
    // Ya se intentó renovar y falló → Logout
    await logout();
    Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente');
  } else if (error.message.includes('Network')) {
    Alert.alert('Sin Conexión', 'Verifica tu conexión a internet');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

---

##  Mejores Prácticas

###  DO (Hacer)

1. **Siempre usa `api` de `apiConnection.js`** para peticiones protegidas
2. **Usa `useAuth()` hook** para acceder al estado de autenticación
3. **Maneja errores apropiadamente** en cada componente
4. **Llama `logout()`** cuando el usuario cierre sesión manualmente

###  DON'T (No Hacer)

1. **No guardes tokens en variables de estado de React** (usa AsyncStorage)
2. **No crees instancias de axios directamente** (usa `api` configurado)
3. **No ignores errores 401** sin manejarlos
4. **No expongas tokens en logs** o consola en producción

---

##  Seguridad

### Tokens en el Backend

- **Access Token**: Expira en **15 minutos**
- **Refresh Token**: Expira en **7 días**
- Se almacenan en la tabla `refresh_tokens` con info de seguridad:
  - IP address
  - User agent
  - Fecha de creación
  - Estado (revocado/activo)

### Mejoras de Seguridad Implementadas

 Tokens con expiración corta  
 Refresh tokens almacenados en BD  
 Posibilidad de revocar tokens individualmente  
 Registro de IP y dispositivo  
 Eliminación automática al borrar usuario  
 Interceptors para renovación transparente  

---

##  Troubleshooting

### Problema: "No se puede conectar al servidor"
**Solución**: Verifica que el `BASE_URL` en `apiConnection.js` apunte a la IP correcta de tu backend

```javascript
// apiConnection.js
const BASE_URL = 'http://192.168.100.11:3000'; // ← Cambiar según tu red
```

### Problema: "Sesión expira inmediatamente"
**Solución**: Verifica que los tokens se estén guardando correctamente

```javascript
// Agregar console.log temporal
const { login } = useAuth();
console.log('Tokens guardados:', accessToken, refreshToken);
```

### Problema: "Loop infinito de renovación"
**Solución**: Verifica que el endpoint `/auth/refresh` funcione en el backend

```bash
# Test manual
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"tu_token_aqui"}'
```

---

##  Referencias

- [Documentación JWT Backend](../backend/DOCUMENTACION_COMPLETA_JWT.md)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 👥 Contribución

Si necesitas agregar una nueva API protegida:

1. Crea tu archivo en `src/Hook/Api/tuApi.js`
2. Importa `api` de `apiConnection.js`
3. Usa `api.get()`, `api.post()`, etc.
4. ¡El token se agrega automáticamente!

```javascript
// src/Hook/Api/tuApi.js
import api from './apiConnection';

export const getTusDatos = async () => {
  const response = await api.get('/tu-endpoint');
  return response.data;
};
```
