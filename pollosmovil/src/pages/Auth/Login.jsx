import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";



export default function Login({ onLoginSuccess }) {
    // form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigation = useNavigation();

    // simple email validation
    const isValidEmail = (value) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(value);
    };

    // handle the fake login action (client-side only)
    const handleLogin = () => {
        setError("");

        if (!email.trim() || !password) {
            setError("Por favor completa todos los campos.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Ingresa un correo válido.");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }


        setLoading(true);
        setTimeout(() => {
            setLoading(false);

            if (typeof onLoginSuccess === "function") {
                onLoginSuccess({ email });
            }
            else {
                Alert.alert("Inicio de sesión", "Inicio de sesión exitoso (simulado).");
            }
            // clear form
            setEmail("");
            setPassword("");
            setSecure(true);
        }, 900);
    };


    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError("");
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (error) setError("");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

                    <View style={styles.form}>
                        <View style={styles.inputRow}>
                            <Icon name="email-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                value={email}
                                onChangeText={handleEmailChange}
                                placeholder="Correo electrónico"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                returnKeyType="next"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <Icon name="lock-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                value={password}
                                onChangeText={handlePasswordChange}
                                placeholder="Contraseña"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={secure}
                                style={[styles.input, { paddingRight: 44 }]}
                                returnKeyType="done"
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setSecure((s) => !s)}
                                style={styles.toggleSecure}
                                disabled={loading}
                            >
                                <Icon name={secure ? "eye-off" : "eye"} size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, (loading || !email || !password) && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? "Ingresando..." : "Iniciar sesión"}</Text>
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <TouchableOpacity>
                                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={[styles.link, styles.linkPrimary]}>Regístrate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Al iniciar, aceptas los términos y políticas.</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f4f6f8",
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginTop: 6,
        marginBottom: 18,
    },
    form: {
        marginTop: 6,
    },
    inputRow: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e6edf3",
        backgroundColor: "#fbfdff",
        borderRadius: 12,
        paddingLeft: 12,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        color: "#111827",
        fontSize: 15,
    },
    toggleSecure: {
        position: "absolute",
        right: 10,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    errorText: {
        color: "#b91c1c",
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 4,
    },
    button: {
        backgroundColor: "#0077cc",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 16,
    },
    row: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    link: {
        color: "#6b7280",
        fontSize: 13,
    },
    linkPrimary: {
        color: "#0077cc",
        fontWeight: "600",
    },
    footer: {
        marginTop: 18,
        alignItems: "center",
    },
    footerText: {
        color: "#9ca3af",
        fontSize: 12,
    },
});
