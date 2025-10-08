import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert
} from "react-native";
import HeaderPrincipal from '../components/header.jsx';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function Perfil() {
    const navigation = useNavigation();

    // Estados
    const [imagen, setImagen] = useState(null);
    const [identificacion, setIdentificacion] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [direccion, setDireccion] = useState("");

    const actualizarPerfil = () => {
        console.log({ identificacion, nombre, telefono, correo, contrasena, direccion });
        alert("Perfil actualizado correctamente");
    };

    // Seleccionar imagen (cámara o galería)
    const seleccionarImagen = () => {
        Alert.alert(
            "Seleccionar imagen",
            "Elige una opción",
            [
                {
                    text: "Cámara",
                    onPress: () => {
                        launchCamera({ mediaType: "photo", includeBase64: false }, (response) => {
                            if (response.assets && response.assets.length > 0) {
                                setImagen(response.assets[0].uri);
                            }
                        });
                    }
                },
                {
                    text: "Galería",
                    onPress: () => {
                        launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
                            if (response.assets && response.assets.length > 0) {
                                setImagen(response.assets[0].uri);
                            }
                        });
                    }
                },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <HeaderPrincipal
                title={"Perfil"}
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <TouchableOpacity onPress={seleccionarImagen} style={styles.editIcon}>
                                <Icon name='pencil' size={20} color={'black'} />
                            </TouchableOpacity>
                            {imagen ? (
                                <Image source={{ uri: imagen }} style={styles.avatarImage} />
                            ) : (
                                <Icon name='account' size={60} color={'black'} />
                            )}
                        </View>
                        <Text style={styles.title}>Perfil de usuario</Text>
                    </View>

                    {/* Campos */}
                    <Campo label="Identificación" value={identificacion} onChange={setIdentificacion} placeholder="Ingrese su número de identificación" />
                    <Campo label="Nombre" value={nombre} onChange={setNombre} placeholder="Ingrese su nombre" />
                    <Campo label="Teléfono" value={telefono} onChange={setTelefono} placeholder="Ingrese su teléfono" keyboardType="phone-pad" />
                    <Campo label="Correo" value={correo} onChange={setCorreo} placeholder="Ingrese su correo" keyboardType="email-address" />
                    <Campo label="Contraseña" value={contrasena} onChange={setContrasena} placeholder="Ingrese su contraseña" secureTextEntry={true} />
                    <Campo label="Dirección" value={direccion} onChange={setDireccion} placeholder="Ingrese su dirección" />

                    {/* Botón */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={actualizarPerfil}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Actualizar</Text>
                    </TouchableOpacity>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// Campo de texto reutilizable
const Campo = ({ label, value, onChange, placeholder, keyboardType, secureTextEntry }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
        />
    </View>
);

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        backgroundColor: '#ddd',
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
