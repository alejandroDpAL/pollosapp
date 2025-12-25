// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,Alert,ActivityIndicator,StyleSheet,KeyboardAvoidingView,Platform,StatusBar,ScrollView,} from "react-native";
import { useAuth } from "../../Hook/context/AuthContext.jsx";
import { loginUser } from "../../Hook/Api/auth.Api";
import ModalAlert from "../../components/common/Modal.Alet";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("info");


    const { login } = useAuth();

    // Validación de email en tiempo real
    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmail(text);
        if (text && !emailRegex.test(text)) {
            setErrors((prev) => ({ ...prev, email: "Formato de correo inválido" }));
        } else {
            setErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setModalType("warning");
            setModalMessage("Por favor complete todos los campos");
            setModalVisible(true);
            return;
        }

        if (errors.email) {
            setModalType("error");
            setModalMessage("Por favor ingrese un correo válido");
            setModalVisible(true);
            return;
        }

        setLoading(true);
        try {
            const response = await loginUser(email, password);
            if (response.success) {
                // Pasar user, accessToken y refreshToken al contexto
                login({
                    user: response.user,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                });
            } else {
                setModalType("error");
                setModalMessage(response.message || "Credenciales inválidas");
                setModalVisible(true);
            }
        } catch (error) {
            setModalType("error");
            setModalMessage(error.message || "Error de autenticación");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView >
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoBadge}>
                                    <Text style={styles.logoText}>P</Text>
                                </View>
                            </View>
                            <Text style={styles.companyName}>POLLOS APP</Text>
                            <Text style={styles.tagline}>Sistema de Gestión Empresarial</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Iniciar Sesión</Text>
                            <Text style={styles.formSubtitle}>
                                Ingrese sus credenciales para acceder al sistema
                            </Text>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correo Electrónico</Text>
                                <View
                                    style={[
                                        styles.inputContainer,
                                        emailFocused && styles.inputFocused,
                                        errors.email && styles.inputError,
                                    ]}
                                >
                                    <TextInput
                                        placeholder="usuario@empresa.com"
                                        placeholderTextColor="#9CA3AF"
                                        value={email}
                                        onChangeText={validateEmail}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        style={styles.input}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        editable={!loading}
                                    />
                                </View>
                                {errors.email ? (
                                    <Text style={styles.errorText}>{errors.email}</Text>
                                ) : null}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña</Text>
                                <View
                                    style={[
                                        styles.inputContainer,
                                        passwordFocused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput
                                        placeholder="Ingrese su contraseña"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        secureTextEntry={!showPassword}
                                        style={[styles.input, styles.passwordInput]}
                                        autoComplete="password"
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        disabled={loading}
                                    >
                                        <Text style={styles.eyeText}>
                                            {showPassword ? "Ocultar" : "Mostrar"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading || !!errors.email}
                                style={[
                                    styles.loginButton,
                                    (loading || errors.email) && styles.loginButtonDisabled,
                                ]}
                                activeOpacity={0.7}
                            >
                                {loading ? (
                                    <View style={styles.buttonContent}>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.loginButtonText}>Autenticando...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>

                            {/* Help Text */}
                            <View style={styles.helpContainer}>
                                <Text style={styles.helpText}>
                                    ¿Problemas para acceder?{" "}
                                </Text>
                                <TouchableOpacity disabled={loading}>
                                    <Text style={styles.helpLink}>Contactar soporte</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                © 2025 Pollos App. Todos los derechos reservados.
                            </Text>
                            <Text style={styles.footerVersion}>Versión 1.0.0</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <ModalAlert
                visible={modalVisible}
                type={modalType}
                title={modalType === "error" ? "Error" : "Aviso"}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
    },
    companyName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "400",
    },
    formCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 24,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingHorizontal: 14,
        height: 48,
    },
    inputFocused: {
        borderColor: "#1F2937",
        backgroundColor: "#fff",
    },
    inputError: {
        borderColor: "#DC2626",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        paddingVertical: 0,
    },
    passwordInput: {
        paddingRight: 10,
    },
    eyeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    eyeText: {
        fontSize: 13,
        color: "#4B5563",
        fontWeight: "500",
    },
    errorText: {
        fontSize: 12,
        color: "#DC2626",
        marginTop: 6,
        marginLeft: 2,
    },
    loginButton: {
        backgroundColor: "#1F2937",
        borderRadius: 8,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    loginButtonDisabled: {
        backgroundColor: "#9CA3AF",
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    helpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        alignItems: "center",
    },
    helpText: {
        fontSize: 14,
        color: "#6B7280",
    },
    helpLink: {
        fontSize: 14,
        color: "#1F2937",
        fontWeight: "600",
    },
    footer: {
        marginTop: "auto",
        alignItems: "center",
        paddingTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    footerVersion: {
        fontSize: 11,
        color: "#D1D5DB",
    },
});