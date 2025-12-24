# ALERTA DE SEGURIDAD - .env Expuesto en Git

##  Problema Identificado

El archivo `.env` con credenciales sensibles fue subido a GitHub en commits anteriores, exponiendo:
- Credenciales de base de datos
- Secreto JWT (`AUTH_SECRET`)
- Configuración del servidor

##  Solución Aplicada

### 1. **Archivo .env Removido del Repositorio**
```bash
git rm --cached backend/src/env/.env
```
El archivo fue eliminado del índice de Git pero **permanece en tu máquina local**.

### 2. **Nuevo Secreto JWT Generado**
Se generó un nuevo `AUTH_SECRET` criptográficamente seguro de 512 bits (128 caracteres hexadecimales).

** IMPORTANTE:** El secreto anterior `esunsecretoentumirada` está comprometido. Ya fue reemplazado.

### 3. **Archivos Creados**
-  `backend/.gitignore` - Previene que .env se suba
-  `backend/src/env/.env.example` - Plantilla sin datos sensibles

##  Próximos Pasos CRÍTICOS

### 1. Hacer Commit de los Cambios
```bash
cd backend
git add .gitignore src/env/.env.example
git commit -m "security: remove .env from git and add .gitignore"
git push
```

### 2. **IMPORTANTE:** Limpiar el Historial Completo (Opcional pero Recomendado)

Si quieres eliminar completamente el `.env` del historial de Git:

```bash
# Instalar git-filter-repo (si no lo tienes)
pip install git-filter-repo

# Desde la raíz del proyecto
git filter-repo --path backend/src/env/.env --invert-paths

# Force push (CUIDADO: reescribe el historial)
git push origin --force --all
```

 **ADVERTENCIA:** Esto reescribirá el historial de Git. Todos los colaboradores necesitarán clonar el repo de nuevo.

### 3. Rotar Credenciales Comprometidas

Si las credenciales expuestas son de producción o importante:

**Base de Datos:**
```sql
-- Cambiar password del usuario MySQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nuevo_password_seguro';
```

**JWT Secret:**
 Ya cambiado en `.env` local

##  Verificación

### Asegúrate que .env NO esté en el repositorio:
```bash
git ls-files | grep .env
```
**Resultado esperado:** Solo debe aparecer `.env.example`

### Verifica el .gitignore:
```bash
cat backend/.gitignore
```
Debe contener `.env` en la lista.

##  Prevención Futura

### 1. **Siempre usa .env.example**
- Mantén `.env.example` con valores de plantilla
- Documenta todas las variables necesarias
- NUNCA pongas valores reales ahí

### 2. **Verifica antes de commit**
```bash
git status
```
Si ves `.env` listado, NO hagas commit.

### 3. **Configura pre-commit hooks** (Opcional)
```bash
# Instalar
npm install --save-dev husky

# Configurar
npx husky init
echo "git diff --cached --name-only | grep -q '.env$' && echo 'ERROR: Intentando commitear .env' && exit 1" > .husky/pre-commit
```

### 4. **Usa gestores de secretos en producción**
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Variables de entorno del hosting (Heroku, Vercel, etc.)

##  Generar Nuevos Secretos JWT

Si necesitas generar más secretos seguros:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

##  Referencias

- [OWASP: Manejo de Secretos](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [12 Factor App: Config](https://12factor.net/config)

---

##  Resumen Rápido

1.  `.env` removido del índice de Git
2.  Nuevo secreto JWT generado (512 bits)
3.  `.gitignore` creado en backend
4.  `.env.example` creado como plantilla
5. ⏳ **PENDIENTE:** Hacer commit y push de los cambios
6. ⏳ **OPCIONAL:** Limpiar historial completo con `git filter-repo`

---

**Fecha:** 22 de diciembre de 2025  
**Branch afectado:** Implemet_jsonwebtoken  
**Archivo comprometido:** `backend/src/env/.env`  
**Estado:** Mitigado (pendiente push)
