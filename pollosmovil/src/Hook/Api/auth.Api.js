// src/api/auth.Api.js
import api from "./apiConnection";

export const loginUser = async (user, password) => {
  try {
    const response = await api.post("/auth/authLogin", {
      user,
      password
    });

    // Extraer los datos del usuario de la respuesta del backend
    const { message, user: userData } = response.data;

    // Verificar que tengamos el ID del usuario
    if (!userData || !userData.id) {
      throw new Error("Error de autenticación: No se recibió información del usuario");
    }

    // Retornar los datos estructurados
    return {
      success: true,
      message: message || "Autenticación exitosa",
      user: {
        id: userData.id,
        correo: user, // Guardamos el correo usado para el login
      }
    };
  } catch (error) {
    // Manejo de errores según el backend
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      // Errores específicos del backend
      switch (status) {
        case 400:
          throw new Error(message || "Datos de entrada inválidos");
        case 401:
          throw new Error(message || "Credenciales inválidas");
        case 500:
          throw new Error("Error interno del servidor. Intente más tarde");
        default:
          throw new Error(message || "Error de autenticación");
      }
    } else if (error.request) {
      // Error de red - no se recibió respuesta
      throw new Error("No se pudo conectar al servidor. Verifique su conexión");
    } else {
      // Error en la configuración de la petición
      throw new Error(error.message || "Error al procesar la solicitud");
    }
  }
};

// Función opcional para validar formato de email (cliente)
export const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};