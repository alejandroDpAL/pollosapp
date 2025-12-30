import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalAlert from '../../components/common/Modal.Alet.jsx';
import { getNegociosByUsuario } from '../../Hook/Api/negocioApi';
import { useAuth } from '../../Hook/context/AuthContext';
import { useNegocio } from '../../Hook/context/NegocioContext';

const SelectNegocio = ({ navigation }) => {
  const { user } = useAuth();
  const { selectNegocio } = useNegocio();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionando, setSeleccionando] = useState(false);
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });

  useEffect(() => {
    cargarNegocios();
  }, []);

  const cargarNegocios = async () => {
    try {
      const data = await getNegociosByUsuario(user.id);
      setNegocios(data || []);
    } catch (error) {
      console.error('Error al cargar negocios:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudieron cargar los negocios',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarNegocio = async (negocio) => {
    setSeleccionando(true);
    try {
      await selectNegocio(negocio);
      // El RootNavigator detectará el cambio y navegará automáticamente
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudo seleccionar el negocio',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setSeleccionando(false);
    }
  };

  const renderNegocioCard = ({ item }) => (
    <TouchableOpacity
      style={styles.negocioCard}
      onPress={() => handleSeleccionarNegocio(item)}
      disabled={seleccionando}
    >
      <View style={styles.negocioIcon}>
        <Icon name="office-building" size={32} color="#0077cc" />
      </View>
      <View style={styles.negocioInfo}>
        <Text style={styles.negocioNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.negocioDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <View style={styles.negocioMeta}>
          <Icon name="phone" size={14} color="#6b7280" />
          <Text style={styles.negocioMetaText}>{item.telefono}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text style={styles.loadingText}>Cargando negocios...</Text>
      </View>
    );
  }

  if (negocios.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="store-alert" size={80} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No tienes negocios registrados</Text>
        <Text style={styles.emptyText}>
          Necesitas crear un negocio para empezar a trabajar
        </Text>
        <TouchableOpacity
          style={styles.btnCrear}
          onPress={() => navigation.navigate('CrearNegocio')}
        >
          <Icon name="plus-circle" size={20} color="#fff" />
          <Text style={styles.btnCrearText}>Crear mi primer negocio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="briefcase-check" size={40} color="#0077cc" />
        <Text style={styles.title}>Selecciona tu negocio</Text>
        <Text style={styles.subtitle}>
          ¿En qué negocio estás trabajando hoy?
        </Text>
      </View>

      <FlatList
        data={negocios}
        renderItem={renderNegocioCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {seleccionando && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Seleccionando negocio...</Text>
        </View>
      )}

      <ModalAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null })}
        onConfirm={alertModal.onConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  btnCrear: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0077cc',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  btnCrearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  negocioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  negocioIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  negocioInfo: {
    flex: 1,
  },
  negocioNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  negocioDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  negocioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  negocioMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SelectNegocio;
