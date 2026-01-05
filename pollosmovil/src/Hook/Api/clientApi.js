import api from "./apiConnection";


export const getClients = async () => {
  try {
    const response = await api.get("/cliente/listar");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};


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



export const getVentasByCliente = async (clienteId) => {
  try {
    // Redirigir a la función correcta
    return await getComprasByCliente(clienteId);
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    return { message: "Error", total_gastado: 0, cantidad_compras: 0, compras: [] };
  }
};


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
