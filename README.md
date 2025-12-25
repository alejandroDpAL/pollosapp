# PollosApp - Autenticación JWT

**Estado**: ✅ Completado y funcionando  
**Plataforma**: React Native + Node.js + JWT

---

## 📱 App Instalada y Ejecutándose

- **Package**: com.pollosmovil
- **Emulador**: Android 36
- **Estado**: RUNNING (PID 5401)
- **APK**: 100 MB compilado

---

## 🎯 Funcionalidades

✅ Login con JWT  
✅ Persistencia de tokens (AsyncStorage)  
✅ Axios interceptores automáticos  
✅ Navegación condicional  
✅ Logout completo  

---

## 📁 Estructura

```
backend/src/
├── controllers/controler.auth.js    ← JWT Logic
├── middleware/auth.middleware.js    ← Token Validation
├── routes/ruta.auth.js              ← /api/auth endpoints
└── utils/jwt.util.js                ← JWT Utils

pollosmovil/src/
├── Hook/context/AuthContext.jsx     ← Auth State
├── pages/Auth/Login.jsx             ← Login Screen
├── services/apiConnection.js        ← Axios Config
└── App.jsx                          ← Entry Point
```

---

## 🚀 Ejecutar npm run android

```bash
cd pollosmovil

# IMPORTANTE: Esperar 90+ segundos para que Android boot
# Luego ejecutar:
npm run android
```

---

## 🔐 Credenciales

```
Email: usuario@example.com
Password: password123
```

---

## 📊 Backend

```bash
cd backend
npm install
npm run dev
```

Puerto: 3000

---

## ✨ Verificación

```powershell
# App instalada
adb shell pm list packages | Select-String com.pollos

# App ejecutándose
adb shell pidof com.pollosmovil

# Logs
adb logcat
```

---

**Completado**: 25 Diciembre 2025
