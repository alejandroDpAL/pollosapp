import api from "./apiConnection";

// Obtener todos los productos
export const getProducts = async () => {
  try {
    const response = await api.get("/producto/listar");
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

export const getProductosByNegocio = async (negocioId) => {
  try {
    const response = await api.get(`/producto/negocio/${negocioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos del negocio:", error);
    throw error;
  }
};