import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalAlert from '../common/Modal.Alet.jsx';
import { useNegocio } from '../../Hook/context/NegocioContext';

const HeaderPrincipal = ({ title, showBack = false, onBack }) => {
  const { negocioActivo, clearNegocio } = useNegocio();
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });

  const handleCambiarNegocio = () => {
    setAlertModal({
      visible: true,
      title: 'Cambiar Negocio',
      message: `¿Deseas cambiar de "${negocioActivo?.nombre}" a otro negocio?`,
      type: 'warning',
      onConfirm: async () => {
        setAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
        await clearNegocio();
      }
    });
  };

  return (
    <View style={styles.container}>

      {showBack ? (
        <TouchableOpacity style={styles.left} onPress={onBack}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.left} onPress={handleCambiarNegocio}>
          <Icon name="office-building" size={24} color="#0077cc" />
        </TouchableOpacity>
      )}

      <View style={styles.centerContent}>
        <Text style={styles.tittle}>{title}</Text>
        {negocioActivo && (
          <Text style={styles.subtitle}>{negocioActivo.nombre}</Text>
        )}
      </View>

      <View style={styles.logo}>
        <Icon name='account' size={25} color={'black'} />
      </View>

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
    minHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#bbb',
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
  },
  tittle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: '#ffadadff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderPrincipal;
