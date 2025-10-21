import api from "./apiConnection";

// Obtener todos los usuarios
export const getUsers = async () => {
    try {
        const response = await api.get("/usuario/listar");
        return response.data;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        console.log(error);

        throw error;
    }
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
    try {
        const response = await api.post("/usuario/crear", userData);
        return response.data;
    } catch (error) {
        console.error("Error al crear usuario:", error);
        throw error;
    }
};

// Actualizar un usuario existente
export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/usuario/actualizar/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw error;
    }
};

// Eliminar un usuario
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/usuario/eliminar/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw error;
    }
};
