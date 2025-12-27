import api from "./apiConnection";

export const getLotesByUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/lote/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener lotes del usuario:", error);
    throw error;
  }
};

export const getAllLotes = async () => {
  try {
    const response = await api.get("/lote/listar");
    return response.data;
  } catch (error) {
    console.error("Error al obtener lotes:", error);
    throw error;
  }
};

export const getLoteById = async (loteId) => {
  try {
    const response = await api.get(`/lote/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle del lote:", error);
    throw error;
  }
};
