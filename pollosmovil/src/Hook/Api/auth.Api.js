// src/api/auth.Api.js
import api from "./apiConnection";

export const loginUser = async (user, password) => {
  try {
    const response = await api.post("/auth/authLogin", {
      user,
      password
    });

    // Extraer datos completos del backend (user, accessToken, refreshToken)
    const { message, user: userData, accessToken, refreshToken } = response.data;

    // Verificar que tengamos todos los datos necesarios
    if (!userData || !userData.id) {
      throw new Error("Error de autenticación: No se recibió información del usuario");
    }

    if (!accessToken || !refreshToken) {
      throw new Error("Error de autenticación: No se recibieron los tokens");
    }

    // Retornar los datos estructurados con tokens
    return {
      success: true,
      message: message || "Autenticación exitosa",
      user: {
        id: userData.id,
        correo: user,
      },
      accessToken,
      refreshToken
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