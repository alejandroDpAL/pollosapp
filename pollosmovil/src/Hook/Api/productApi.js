import api from "./apiConnection";

// Get all clients
export const getProducts = async () => {
  try {
    const response = await api.get("/producto/listar");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    console.log(error);

    throw error;
  }
};