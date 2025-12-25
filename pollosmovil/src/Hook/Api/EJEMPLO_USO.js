// EJEMPLO DE USO: Cómo usar api en cualquier vista

/*
====================================================================
CORRECTO - Usar api importado con interceptores automáticos
====================================================================
*/

import api from '../../Hook/Api/apiConnection';

// 1. GET request - El token se agrega automáticamente
useEffect(() => {
  const fetchClientes = async () => {
    try {
      const response = await api.get('/cliente');
      setClientes(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchClientes();
}, []);

// 2. POST request - También automático
const crearCliente = async (datos) => {
  try {
    const response = await api.post('/cliente', datos);
    console.log('Cliente creado:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

/*
====================================================================
 INCORRECTO - NO hacer esto
====================================================================
*/

// ❌ NO pases manualmente el token
const token = await AsyncStorage.getItem('accessToken');
axios.get('/cliente', {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ NO uses axios directamente sin importar api
import axios from 'axios';
axios.get('http://192.168.100.11:3000/cliente');

/*
====================================================================
REFRESH AUTOMÁTICO
====================================================================

Si el accessToken expira (401):
1. El interceptor detecta el error 401
2. Obtiene el refreshToken de AsyncStorage
3. Llama a /auth/refresh
4. Guarda el nuevo accessToken
5. Reintenta la petición original automáticamente
6. Si refresh falla → limpia tokens y vuelve al login

TODO ESTO ES AUTOMÁTICO. No necesitas hacer nada.
====================================================================
*/

/*
====================================================================
🚪 LOGOUT
====================================================================
*/

import { useAuth } from '../../Hook/context/AuthContext';

const { logout } = useAuth();

const handleLogout = async () => {
  try {
    // Opcional: llamar al backend para invalidar el refresh token
    await api.post('/auth/logout');
  } catch (error) {
    console.log('Error en logout:', error);
  } finally {
    // Limpia tokens locales y cambia a AuthNavigator
    await logout();
  }
};


