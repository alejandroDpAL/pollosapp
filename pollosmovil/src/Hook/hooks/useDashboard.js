import { useState, useEffect } from 'react';
import { getEstadisticasNegocio, getVentasPorDia, getUltimasVentas } from '../Api/DashboardApi.js';

export const useDashboard = (negocioId, forceLogoutWithMessage) => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [ultimasVentas, setUltimasVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los datos del dashboard
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [statsData, chartDataResult, ventasData] = await Promise.all([
        getEstadisticasNegocio(negocioId),
        getVentasPorDia(negocioId, 7),
        getUltimasVentas(negocioId, 5)
      ]);

      setStats(statsData?.data || statsData);
      setChartData(chartDataResult || []);
      setUltimasVentas(ventasData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      if (error?.response?.status === 401) {
        await forceLogoutWithMessage('Tu sesión ha sido cerrada. Vuelve a iniciar sesión.');
      } else {
        setError('No se pudieron cargar los datos del dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para gráfico de estados de ventas
  const procesarDatosEstados = () => {
    if (!ultimasVentas || ultimasVentas.length === 0) return [];

    const conteos = {
      'pagado': 0,
      'pendiente': 0,
      'anulado': 0
    };

    ultimasVentas.forEach(venta => {
      if (conteos.hasOwnProperty(venta.estado)) {
        conteos[venta.estado]++;
      }
    });

    return [
      { label: 'Pagadas', value: conteos.pagado },
      { label: 'Pendientes', value: conteos.pendiente },
      { label: 'Anuladas', value: conteos.anulado }
    ];
  };

  // Procesar datos para gráfico de ventas por producto
  const procesarDatosProductos = () => {
    if (!ultimasVentas || ultimasVentas.length === 0) return [];

    const ventasPorProducto = {};

    ultimasVentas.forEach(venta => {
      const producto = venta.producto_nombre || 'Sin producto';
      if (!ventasPorProducto[producto]) {
        ventasPorProducto[producto] = 0;
      }
      ventasPorProducto[producto] += parseInt(venta.cantidad) || 0;
    });

    return Object.entries(ventasPorProducto)
      .map(([nombre, cantidad]) => ({
        label: nombre.substring(0, 10),
        value: cantidad
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 productos
  };

  // Cargar datos cuando cambia el negocioId
  useEffect(() => {
    if (negocioId) {
      cargarDatos();
    }
  }, [negocioId]);

  return {
    stats,
    chartData,
    ultimasVentas,
    loading,
    error,
    cargarDatos,
    procesarDatosEstados,
    procesarDatosProductos
  };
};
