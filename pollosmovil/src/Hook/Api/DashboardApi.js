import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.100.11:3000';


export const getEstadisticasNegocio = async (negocioId) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('No hay token de acceso');
    }

    const response = await axios.get(
      `${API_BASE_URL}/dashboard/stats/${negocioId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('[DashboardApi] Error al obtener estadísticas:', error);
    console.error('[DashboardApi] Error response:', error.response?.data);
    console.error('[DashboardApi] Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Obtener datos de ventas por día para gráficos
 * @param {number} negocioId - ID del negocio
 * @param {number} days - Número de días (default: 7)
 * @returns {Promise} Datos de gráfico
 */
export const getVentasPorDia = async (negocioId, days = 7) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      console.warn('No hay token de acceso');
      return [];
    }

    const response = await axios.get(
      `${API_BASE_URL}/dashboard/chart/ventas/${negocioId}`,
      {
        params: { days },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('No se pudieron cargar datos del gráfico:', error?.message);
    // Retornar array vacío sin fallar
    return [];
  }
};

/**
 * Obtener últimas ventas con detalles
 * @param {number} negocioId - ID del negocio
 * @param {number} limit - Número de ventas a obtener (default: 10)
 * @returns {Promise} Datos de últimas ventas
 */
export const getUltimasVentas = async (negocioId, limit = 10) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      return [];
    }

    const response = await axios.get(
      `${API_BASE_URL}/dashboard/ultimas-ventas/${negocioId}`,
      {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[DashboardApi] Error al obtener últimas ventas:', error?.message);
    return [];
  }
};

