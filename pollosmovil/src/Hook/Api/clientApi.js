import api from "./apiConnection";

// Get all clients
export const getClients = async () => {
  try {
    const response = await api.get("/cliente/listar");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};


export const getClientById = async (clientId) => {
  try {
    const response = await api.get(`/cliente/ClienteUsuario/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    throw error;
  }
};


export const getVentasByCliente = async (clienteId) => {
  try {
    // const response = await api.get(`/ventas/cliente/${clienteId}`);
    const response = await api.get(`/ventas/clientes/${clienteId}/ventas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    return [];
  }
};


// Create a new client
export const createClient = async (clientData) => {
  try {
    const response = await api.post(`/cliente/registrar`, clientData);
    return response.data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

// Update existing client
export const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`/cliente/actualizar/${id}`, clientData);

    // Si el backend no devuelve data, devolvemos un mensaje genérico
    return response?.data || { message: "Cliente actualizado (sin respuesta del servidor)." };
  } catch (error) {
    console.error("Error updating client:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al actualizar cliente." };
  }
};


// Delete client
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/cliente/eliminar/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};
