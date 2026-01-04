import api from "./apiConnection";

/**
 * Obtiene la lista de todos los clientes
 * @returns {Promise<Array>} Array de clientes
 * @throws {Error} Si la petición falla
 */
export const getClients = async () => {
  try {
    const response = await api.get("/cliente/listar");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};

/**
 * Obtiene los clientes asociados a un usuario específico
 * @param {number} clientId - ID del usuario
 * @returns {Promise<Array>} Array de clientes del usuario
 * @throws {Error} Si la petición falla
 */
export const getClientById = async (clientId, negocioId = null) => {
  try {
    if (!clientId) {
      throw new Error("El ID del cliente es requerido");
    }
    
    const query = negocioId ? `?negocio_id=${negocioId}` : "";
    const response = await api.get(`/cliente/ClienteUsuario/${clientId}${query}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener clientes del usuario:", error);
    throw error;
  }
};


/**
 * Obtiene las compras realizadas por un cliente específico
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<{message: string, total_gastado: number, cantidad_compras: number, compras: Array}>}
 * @throws {Error} Si la petición falla
 */
export const getComprasByCliente = async (clienteId) => {
  try {
    if (!clienteId || clienteId <= 0) {
      throw new Error("El ID del cliente es inválido o no fue proporcionado");
    }
    
    const response = await api.get(`/cliente/usuario/${clienteId}/compras`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    console.error("Error al obtener compras del cliente:", {
      clienteId,
      status: error.response?.status,
      message: errorMessage,
      fullError: error
    });
    throw new Error(errorMessage);
  }
};


/**
 * @deprecated Usar getComprasByCliente en su lugar
 * Obtiene las ventas de un cliente (endpoint alternativo)
 */
export const getVentasByCliente = async (clienteId) => {
  try {
    // Redirigir a la función correcta
    return await getComprasByCliente(clienteId);
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    return { message: "Error", total_gastado: 0, cantidad_compras: 0, compras: [] };
  }
};


/**
 * Crea un nuevo cliente
 * @param {Object} clientData - Datos del cliente
 * @param {string} clientData.nombre - Nombre del cliente (requerido)
 * @param {number} clientData.negocio_id - ID del negocio (requerido)
 * @param {number} clientData.usuario_id - ID del usuario (opcional)
 * @param {string} clientData.telefono - Teléfono del cliente
 * @param {string} clientData.correo - Correo del cliente
 * @param {string} clientData.direccion - Dirección del cliente
 * @returns {Promise<Object>} Respuesta del servidor
 * @throws {Error} Si faltan datos requeridos o la petición falla
 */
export const createClient = async (clientData) => {
  try {
    // Validar datos requeridos
    if (!clientData.nombre || !clientData.nombre.trim()) {
      throw new Error("El nombre del cliente es requerido");
    }
    
    if (!clientData.negocio_id) {
      throw new Error("El ID del negocio es requerido");
    }
    
    if (!clientData.telefono || !clientData.telefono.trim()) {
      throw new Error("El teléfono es requerido");
    }

    const response = await api.post(`/cliente/registrar`, clientData);
    return response.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

/**
 * Actualiza un cliente existente
 * @param {number} id - ID del cliente a actualizar
 * @param {Object} clientData - Datos a actualizar
 * @param {number} clientData.negocio_id - ID del negocio (requerido)
 * @returns {Promise<Object>} Datos del cliente actualizado
 * @throws {Error} Si la petición falla
 */
export const updateClient = async (id, clientData) => {
  try {
    if (!id) {
      throw new Error("El ID del cliente es requerido");
    }

    if (!clientData.negocio_id) {
      throw new Error("El ID del negocio es requerido");
    }

    const response = await api.put(`/cliente/actualizar/${id}`, clientData);
    return response?.data || { message: "Cliente actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar cliente:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al actualizar cliente" };
  }
};

/**
 * Elimina un cliente
 * @param {number} id - ID del cliente a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 * @throws {Error} Si la petición falla
 */
export const deleteClient = async (id) => {
  try {
    if (!id) {
      throw new Error("El ID del cliente es requerido");
    }

    const response = await api.delete(`/cliente/eliminar/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};
