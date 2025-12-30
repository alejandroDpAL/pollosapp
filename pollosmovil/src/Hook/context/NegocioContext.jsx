import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NegocioContext = createContext();

export const NegocioProvider = ({ children }) => {
  const [negocioActivo, setNegocioActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar negocio guardado al iniciar
  useEffect(() => {
    loadNegocioActivo();
  }, []);

  const loadNegocioActivo = async () => {
    try {
      const savedNegocio = await AsyncStorage.getItem('@negocio_activo');
      if (savedNegocio) {
        setNegocioActivo(JSON.parse(savedNegocio));
      }
    } catch (error) {
      console.error('Error al cargar negocio activo:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectNegocio = async (negocio) => {
    try {
      await AsyncStorage.setItem('@negocio_activo', JSON.stringify(negocio));
      setNegocioActivo(negocio);
    } catch (error) {
      console.error('Error al guardar negocio activo:', error);
      throw error;
    }
  };

  const clearNegocio = async () => {
    try {
      await AsyncStorage.removeItem('@negocio_activo');
      setNegocioActivo(null);
    } catch (error) {
      console.error('Error al limpiar negocio activo:', error);
    }
  };

  return (
    <NegocioContext.Provider
      value={{
        negocioActivo,
        selectNegocio,
        clearNegocio,
        loading,
      }}
    >
      {children}
    </NegocioContext.Provider>
  );
};

export const useNegocio = () => {
  const context = useContext(NegocioContext);
  if (!context) {
    throw new Error('useNegocio debe usarse dentro de NegocioProvider');
  }
  return context;
};
