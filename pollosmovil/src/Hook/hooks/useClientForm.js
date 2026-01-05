import { useState } from 'react';
import { createClient, updateClient } from '../Api/clientApi';

export const useClientForm = (user, negocioActivo, onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
  });

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const resetForm = () => {
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      direccion: '',
    });
  };

  
  const loadClientData = (client) => {
    if (!client) {
      resetForm();
      return;
    }

    setFormData({
      nombre: client.nombre || '',
      correo: client.correo || '',
      telefono: client.telefono || '',
      direccion: client.direccion || '',
    });
  };

  /**
   * Actualiza un campo específico del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Valida los datos del formulario
¿   */
  const validateForm = () => {
    if (!formData.nombre?.trim()) {
      return {
        isValid: false,
        error: 'El nombre del cliente es obligatorio.',
      };
    }

    if (!formData.telefono?.trim()) {
      return {
        isValid: false,
        error: 'El teléfono es obligatorio.',
      };
    }

    if (!negocioActivo || !negocioActivo.id) {
      return {
        isValid: false,
        error: 'Debes seleccionar un negocio.',
      };
    }

    if (!user || !user.id) {
      return {
        isValid: false,
        error: 'Usuario no autenticado.',
      };
    }

    return { isValid: true, error: null };
  };

  /**
   * Guarda o actualiza un cliente
   * @param {number|null} clientId - ID del cliente (null para crear nuevo)
   * @returns {Promise<Object>} Resultado de la operación
   */
  const saveClient = async (clientId = null) => {
    // Validar formulario
    const validation = validateForm();
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    setLoading(true);

    try {
      // Preparar datos del cliente
      const clientData = {
        ...formData,
        usuario_id: user.id,
        negocio_id: negocioActivo.id,
      };

      let result;
      let message;

      if (clientId) {
        // Actualizar cliente existente
        result = await updateClient(clientId, clientData);
        message = 'Cliente actualizado con éxito.';
      } else {
        // Crear nuevo cliente
        result = await createClient(clientData);
        message = 'Cliente registrado con éxito.';
      }

      // Ejecutar callback de éxito
      if (onSuccess) {
        await onSuccess(result);
      }

      return {
        success: true,
        message,
        data: result,
      };
    } catch (error) {
      console.error('Error al guardar cliente:', error);

      const errorMessage =
        error?.response?.data?.message ||
        'No se pudo guardar el cliente. Intenta nuevamente.';

      // Ejecutar callback de error
      if (onError) {
        onError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    resetForm,
    loadClientData,
    saveClient,
  };
};
