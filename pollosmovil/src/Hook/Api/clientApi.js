import api from "./apiConnection";

// Get all clients
export const getClients = async () => {
  try {
    const response = await api.get("/cliente/listar");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    console.log(error);

    throw error;
  }
};


export const getClientById = async (id) => {
  try {
    const response = await api.get(`/cliente/ClienteUsuario/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    console.log(error);

    throw error;
  }
};


// Create a new client
export const createClient = async (clientData) => {
  try {
    const response = await api.post("/cliente/crear", clientData);
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
    return response.data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
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
