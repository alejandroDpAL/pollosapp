import api from "./apiConnection";

// Obtener negocios del usuario
export const getNegociosByUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/negocio/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener negocios del usuario:", error);
    throw error;
  }
};

// Obtener detalle de un negocio
export const getNegocioById = async (negocioId) => {
  try {
    const response = await api.get(`/negocio/negocios/${negocioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle del negocio:", error);
    throw error;
  }
};

// Crear negocio
export const crearNegocio = async (negocioData) => {
  try {
    const response = await api.post('/negocio/crear_negocio', negocioData);
    return response.data;
  } catch (error) {
    console.error("Error al crear negocio:", error);
    throw error;
  }
};

// Anular negocio (cambiar estado a inactivo y anular ventas)
export const anularNegocio = async (negocioId, usuarioId) => {
  try {
    const response = await api.put(`/negocio/anular/${negocioId}`, {
      usuario_id: usuarioId
    });
    return response.data;
  } catch (error) {
    console.error("Error al anular negocio:", error);
    throw error;
  }
};

// Eliminar negocio con validaciones
export const deleteNegocio = async (negocioId, usuarioId) => {
  try {
    const response = await api.delete(`/negocio/eliminar/${negocioId}`, {
      data: { usuario_id: usuarioId }
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar negocio:", error);
    throw error;
  }
};

