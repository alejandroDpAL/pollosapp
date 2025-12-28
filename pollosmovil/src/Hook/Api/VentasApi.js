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

export const registrarVenta = async (ventaData) => {
  try {
    const response = await api.post('/ventas/registrar', ventaData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar venta:", error);
    throw error;
  }
};