import api from "./apiConnection";

export const getVentasAdmin = async (IdAdnmin) => {
  try {
    const response = await api.get(`/ventas/usuario/${IdAdnmin}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    return [];
  }
};

export const getVentasPorNegocio = async (negocioId) => {
  try {
    const response = await api.get(`/ventas/negocio/${negocioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener ventas del negocio:", error);
    return [];
  }
};

export const registrarVenta = async (ventaData) => {
  try {
    const response = await api.post('/ventas/registrar', ventaData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar venta:", error);
    throw error;
  }
};

export const actualizarEstadoVenta = async (ventaId, nuevoEstado) => {
  try {
    const response = await api.put(`/ventas/${ventaId}`, { estado: nuevoEstado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado de venta:", error);
    throw error;
  }
};


export const updateEstadoVentaQuick = async (ventaId, nuevoEstado) => {
  try {
    const response = await api.patch(`/ventas/${ventaId}/estado`, { estado: nuevoEstado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado de venta (PATCH):", error);
    throw error;
  }
};