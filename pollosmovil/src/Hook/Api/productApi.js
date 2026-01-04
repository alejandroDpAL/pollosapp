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

export const createProduct = async (productoData) => {
  try {
    const response = await api.post('/producto/registrar', productoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

export const updateProduct = async (id, productoData) => {
  try {
    const response = await api.put(`/producto/actualizar/${id}`, productoData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/producto/eliminar/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};