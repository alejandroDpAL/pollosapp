import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import HeaderPrincipal from '../../components/layout/header';
import Menu from '../../components/common/bottom.navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Modal from '../../components/common/Modal.componet';



const Ajustes = () => {

  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: null,
    actions: null,
  });

  const openModal = (title, content, actions = null) => {
    setModalContent({ title, content, actions });
    setModalVisible(true);
  }


  return (
    <SafeAreaView style={styles.container}>
      <HeaderPrincipal title={"Ajustes"} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Icon name='account' size={40} color={'black'} />
          </View>

          <Text style={styles.name}>Pablo</Text>
          <Text style={styles.email}>pablo@gmail.com</Text>

          <TouchableOpacity style={styles.editButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones */}
        <View style={styles.menuSection}>
          <OptionItem
            icon="cart-outline"
            title="Mis Ventas"
            onPress={() => openModal(
              "Mis Ventas",
              <Text>Aquí van todas tus ventas realizadas</Text>
            )}
          />

          <OptionItem icon="chart-line" title="Reportes" />
          <OptionItem icon="map-marker-outline" title="Direcciones de entrega" />
          <OptionItem icon="bell-outline" title="Notificaciones" />
          <OptionItem icon="help-circle-outline" title="Ayuda / Soporte" />
          <OptionItem icon="settings-outline" title="Preferencias" />
          <OptionItem icon="logout" title="Cerrar sesión" />

        </View>


        <View style={{ height: 100 }} />

      </ScrollView>


      <Modal
        visible={modalVisible}
        title={modalContent.title}
        content={modalContent.content}
        actions={modalContent.actions}
        onClose={() => setModalVisible(false)}
      />





    </SafeAreaView>
  );
};

const OptionItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Icon name={icon} size={22} color="#333" />
    <Text style={styles.optionText}>{title}</Text>
    <Icon name="chevron-right" size={20} color="#888" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
  },
  menuSection: {
    width: '100%',
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
});

export default Ajustes;
