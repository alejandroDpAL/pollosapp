import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import HeaderPrincipal from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from '../components/Modal.componet';

const Clientes = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: null,
    actions: null,
  });

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    usuario_id: '',
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Función que abre el modal con el formulario
  const handleAddClient = () => {
    setModalContent({
      title: 'Agregar nuevo cliente',
      content: (
        <ScrollView>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Usuario ID"
              value={formData.usuario_id}
              onChangeText={(text) => handleChange('usuario_id', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={formData.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={formData.correo}
              onChangeText={(text) => handleChange('correo', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Dirección"
              value={formData.direccion}
              onChangeText={(text) => handleChange('direccion', text)}
              multiline
            />
          </View>
        </ScrollView>
      ),
      actions: (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            console.log('Datos guardados:', formData);
            setModalVisible(false);
            setFormData({
              usuario_id: '',
              nombre: '',
              telefono: '',
              correo: '',
              direccion: '',
            });
          }}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      ),
    });

    setModalVisible(true);
  };

  return (
    <>
      <HeaderPrincipal title="Clientes" />

      <View style={styles.container}>
        {/* Tarjeta de Usuario */}
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>Juan Pérez</Text>
            <Text style={styles.email}>juan.perez@example.com</Text>
          </View>
        </View>

        {/* Botón flotante de agregar */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal de agregar usuario */}
        <Modal
          visible={modalVisible}
          title={modalContent.title}
          content={modalContent.content}
          actions={modalContent.actions}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </>
  );
};

export default Clientes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff3f3',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#ff6b6b',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  form: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#ce2525',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
