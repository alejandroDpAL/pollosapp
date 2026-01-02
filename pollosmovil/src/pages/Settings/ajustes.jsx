import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import React, { use, useEffect, useState } from "react";
import HeaderPrincipal from "../../components/layout/header";
import Menu from "../../components/common/bottom.navigation";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Modal from "../../components/common/Modal.componet";
import ModalAlert from "../../components/common/Modal.Alet";
import { useAuth } from "../../Hook/context/AuthContext.jsx";
import { useNegocio } from "../../Hook/context/NegocioContext.jsx";
import { UserPerfil } from "../../Hook/Api/userApi";
import { anularNegocio } from "../../Hook/Api/negocioApi";

const Ajustes = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const { negocioActivo, clearNegocio } = useNegocio();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: null,
    actions: null,
  });

  // Estado del modal de confirmación
  const [confirmVisible, setConfirmVisible] = useState(false);
  
  // Estados para gestión de negocios
  const [closingNegocio, setClosingNegocio] = useState(false);
  const [closeAlertModal, setCloseAlertModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });

  const openModal = (title, content, actions = null) => {
    setModalContent({ title, content, actions });
    setModalVisible(true);
  };

  const handleLogout = async () => {
    setConfirmVisible(false);
    try {
      await logout();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleClosarNegocio = (negocio) => {
    setCloseAlertModal({
      visible: true,
      title: 'Cerrar Negocio',
      message: `¿Estás seguro de que deseas cerrar "${negocio.nombre}"?\n\nSe anularán todas las ventas activas y el negocio quedará inactivo.`,
      type: 'warning',
      onConfirm: async () => {
        setClosingNegocio(true);
        try {
          const response = await anularNegocio(negocio.id, user.id);
          
          // Limpiar el negocio activo del contexto
          await clearNegocio();
          
          setCloseAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
          
          // Mostrar éxito y regresar a seleccionar negocio
          setTimeout(() => {
            setCloseAlertModal({
              visible: true,
              title: 'Éxito',
              message: `Negocio cerrado exitosamente.\n\nSe anularon ${response.ventasAnuladas || 0} venta(s) activa(s).`,
              type: 'success',
              onConfirm: () => {
                navigation.navigate('SelectNegocio');
              }
            });
          }, 300);
        } catch (error) {
          console.error("Error al cerrar negocio:", error);
          const errorMsg = error.response?.data?.message || 'No se pudo cerrar el negocio. Intenta nuevamente.';
          
          setCloseAlertModal({
            visible: true,
            title: 'Error',
            message: errorMsg,
            type: 'error',
            onConfirm: null
          });
        } finally {
          setClosingNegocio(false);
        }
      }
    });
  };

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const GetDatosUser = async () => {
      try {
        const data = await UserPerfil(user.id);
        setProfileData(data);
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
      }
    };

    GetDatosUser();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPrincipal title={"Ajustes"} 
/*       showBack={true} 
      onBack={() => navigation.goBack()} */
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.profileSection}>
          {profileData ? (
            <>
              <View style={styles.avatar}>
                <Icon name="account" size={40} color={"black"} />
              </View>

              <Text style={styles.name}>{profileData.nombre}</Text>
              <Text style={styles.email}>{profileData.correo}</Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("Perfil")}
              >
                <Text style={styles.editText}>Editar perfil</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: "#888", marginTop: 20 }}>Cargando perfil...</Text>
          )}
        </View>


        {/* Opciones */}
        <View style={styles.menuSection}>
          <OptionItem
            icon="cart-outline"
            title="Mis Ventas"
            onPress={() =>
              openModal("Mis Ventas", <Text>Aquí van todas tus ventas realizadas</Text>)
            }
          />

          <OptionItem icon="chart-line" title="Reportes" />
          <OptionItem icon="map-marker-outline" title="Direcciones de entrega" />
          <OptionItem icon="bell-outline" title="Notificaciones" />
          <OptionItem icon="help-circle-outline" title="Ayuda / Soporte" />
          <OptionItem icon="settings-outline" title="Preferencias" />
          
          {/* Opción para cerrar el negocio actual */}
          {negocioActivo && (
            <OptionItem
              icon="store-remove"
              title={`Cerrar "${negocioActivo.nombre}"`}
              onPress={() => handleClosarNegocio(negocioActivo)}
              isDelete={true}
            />
          )}
          
          <OptionItem
            icon="logout"
            title="Cerrar sesión"
            onPress={() => setConfirmVisible(true)}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

        
      {/* Modal genérico */}
      <Modal
        visible={modalVisible}
        title={modalContent.title}
        content={modalContent.content}
        actions={modalContent.actions}
        onClose={() => setModalVisible(false)}
      />

      {/* Modal de confirmación de logout */}
      <ModalAlert
        visible={confirmVisible}
        type="warning"
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión?"
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleLogout}
      />

      {/* Modal de alerta para cerrar negocio */}
      <ModalAlert
        visible={closeAlertModal.visible}
        title={closeAlertModal.title}
        message={closeAlertModal.message}
        type={closeAlertModal.type}
        onClose={() => setCloseAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null })}
        onConfirm={closeAlertModal.onConfirm}
      />
    </SafeAreaView>
  );
};

const OptionItem = ({ icon, title, onPress, isDelete }) => (
  <TouchableOpacity 
    style={[styles.option, isDelete && styles.optionDelete]} 
    onPress={onPress}
  >
    <Icon name={icon} size={22} color={isDelete ? "#fff" : "#333"} />
    <Text style={[styles.optionText, isDelete && styles.optionDeleteText]}>{title}</Text>
    <Icon name="chevron-right" size={20} color={isDelete ? "#fff" : "#888"} style={{ marginLeft: "auto" }} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  editText: {
    color: "#fff",
    fontSize: 14,
  },
  menuSection: {
    width: "100%",
    marginTop: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionDelete: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    marginTop: 10,
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  optionDeleteText: {
    color: "#fff",
  },
  negocioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0077cc',
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
    marginBottom: 4,
  },
  negocioContacto: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Ajustes;
