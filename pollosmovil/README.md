this is start
# PollosApp

PollosApp es una aplicación desarrollada para la gestión y control de ventas, clientes, productos y costos de un negocio avícola o de cualquier tipo de microempresa que requiera registrar movimientos de inventario y ventas. Su propósito principal es facilitar la administración de datos relacionados con lotes, pérdidas, reportes y operaciones comerciales de manera clara y accesible.

---

## Descripción General

El proyecto está compuesto por un **backend** desarrollado en **Node.js con Express** y una base de datos **SQL**, además de un **frontend móvil** construido con **React Native**.
El sistema permite registrar información sobre productos, clientes, usuarios, lotes y ventas, centralizando los datos en una estructura relacional sólida y escalable.

---

## Funcionalidades Principales

* Registro y gestión de **usuarios**, **clientes** y **negocios**.
* Control completo de **productos**, **lotes** y **ventas**.
* Seguimiento de **costos**, **pérdidas** y **reportes por lote**.
* Generación de estadísticas para visualizar ingresos, costos y ganancias.
* Módulo de autenticación para proteger el acceso a las funciones del sistema.
* Base de datos estructurada con relaciones entre entidades comerciales.

---

## Arquitectura del Proyecto

**Backend**

* Framework: Node.js con Express
* Base de datos: SQL
* Controladores y rutas modulares
* Autenticación mediante tokens
* Estructura escalable y mantenible

**Frontend (Aplicación móvil)**

* Framework: React Native
* Comunicación con el backend a través de API REST
* Interfaz enfocada en la simplicidad y la eficiencia
* Manejo de contexto para autenticación y estados de usuario

---

## Estructura de la Base de Datos

El modelo relacional incluye las siguientes tablas principales:

* **usuarios**: gestión de credenciales, roles y estado.
* **clientes**: información de contacto y vínculo con usuarios.
* **negocio**: datos del negocio propietario.
* **productos**: inventario general vinculado a cada negocio.
* **lotes**: control detallado de cada grupo de productos.
* **ventas**: registro de operaciones comerciales.
* **costos**: gastos asociados a cada lote.
* **pérdidas**: registro de bajas o incidentes.
* **reportes_lote**: consolidación de datos económicos y operativos.

---

## Instalación y Ejecución

### Requisitos

* Node.js v18 o superior
* Base de datos SQL configurada
* npm o yarn

### Backend

```bash
git clone https://github.com/alejandroDpAL/pollosapp.git
cd pollosapp/backend
npm install
npm run start
```

### Frontend (React Native)

```bash
cd pollosapp/frontend
npm install
npx react-native run-android
```

---

## Objetivo del Proyecto

PollosApp nace como una iniciativa académica y práctica para fortalecer el aprendizaje en desarrollo de software, aplicando principios de diseño, modelado de bases de datos y construcción de APIs. El propósito es crear una herramienta funcional, adaptable y útil para pequeños negocios que buscan digitalizar su gestión.

---

## Aviso y Derechos

Este proyecto **no busca colaboradores externos** ni aportes de terceros.
**PollosApp** está siendo desarrollada únicamente como un **proyecto personal y académico**, sin fines comerciales ni de distribución pública en esta etapa.

Todo el contenido y estructura del proyecto están **protegidos y respaldados ante nuestra autoridad educativa y legal correspondiente**.
Cualquier intento de copia, modificación o uso no autorizado será tratado conforme a las normas aplicables.

---

## Desarrolladores

**Pablo Andrés Perdomo**
**Alejandro David Pasaje**

Desarrolladores junior egresados del **SENA**, con enfoque en crecimiento profesional y aprendizaje continuo en tecnologías de desarrollo web y móvil.
