import api from "./apiConnection";

// Obtener lotes por usuario (LEGACY - para compatibilidad)
export const getLotesByUsuario = async (usuarioId) => {
  try {
    if (!usuarioId) {
      console.error('No hay usuarioId proporcionado');
      throw new Error('usuarioId es requerido');
    }

    console.log('Obteniendo lotes para usuario:', usuarioId);
    const response = await api.get(`/lote/usuario/${usuarioId}`);
    
    console.log('Respuesta lotes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener lotes por usuario:', error.message);
    throw error;
  }
};

// ⭐ NUEVA FUNCIÓN: Obtener lotes por negocio específico
// Solo retorna lotes del negocio activo del usuario autenticado
export const getLotesByNegocio = async (negocioId) => {
  try {
    if (!negocioId) {
      console.error('❌ No hay negocioId proporcionado');
      throw new Error('negocioId es requerido');
    }

    console.log('🔄 Obteniendo lotes para negocio:', negocioId);
    const response = await api.get(`/lote/negocio/${negocioId}`);
    
    console.log('✅ Respuesta lotes por negocio:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener lotes por negocio:', error.message);
    throw error;
  }
};

// Obtener todos los lotes
export const getAllLotes = async () => {
  try {
    const response = await api.get("/lote/listar");
    return response.data;
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    throw error;
  }
};

// Obtener detalle de un lote
export const getLoteDetails = async (loteId) => {
  try {
    const response = await api.get(`/lote/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del lote:', error);
    throw error;
  }
};

// Crear lote
export const createLote = async (loteData) => {
  try {
    const response = await api.post('/lote/crear-lotes', loteData);
    return response.data;
  } catch (error) {
    console.error('Error al crear lote:', error);
    throw error;
  }
};

// Actualizar lote
export const updateLote = async (loteId, loteData) => {
  try {
    const response = await api.put(`/lote/actualizar/${loteId}`, loteData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    throw error;
  }
};

// Obtener stock general
export const getStockGeneral = async () => {
  try {
    const response = await api.get("/lote/stock");
    return response.data;
  } catch (error) {
    console.error('Error al obtener stock general:', error);
    throw error;
  }
};

// Eliminar lote
export const deleteLote = async (loteId) => {
  try {
    const response = await api.delete(`/lote/eliminar/${loteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar lote:', error);
    throw error;
  }
};
