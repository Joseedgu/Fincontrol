# FinControl Backend Server

Backend del proyecto **FinControl**, desarrollado con **Node.js**, **Express**, **MongoDB** y **JWT**.

Este servidor cubre la primera fase funcional del sistema, enfocada en:

- Registro de usuarios
- Inicio de sesión
- Autenticación con JWT
- Protección de rutas
- Endpoint base para el dashboard principal

Además, este repositorio incluye un frontend de prueba llamado `lilfrontfortestthis.html`, creado para validar manualmente los escenarios principales del backend sin necesidad de montar todavía el frontend oficial en Vue.

---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- nodemon

---

## Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

- **Node.js**
- **npm**  
  npm normalmente viene incluido con Node.js.
- **MongoDB Community Server**
- Opcionalmente **mongosh**
- Un navegador web
- Opcionalmente **Postman** o **Insomnia**
- Opcionalmente **Visual Studio Code**

---

## Guía completa para correr el proyecto desde cero

### Paso 1. Instalar Node.js

Descarga e instala Node.js en tu computadora.

Después de instalarlo, abre una terminal y verifica que tanto Node como npm quedaron disponibles:

```bash
node -v
npm -v
```

Si ambos comandos devuelven una versión, entonces Node.js y npm están instalados correctamente.

### Paso 2. Instalar MongoDB Community Server

Instala MongoDB Community Server en tu máquina.

Una vez instalado, asegúrate de que el servicio de MongoDB esté ejecutándose. Este proyecto necesita una base de datos local para funcionar.

Si también instalaste `mongosh`, puedes verificar la conexión con:

```bash
mongosh
```

Si logras entrar a la consola de MongoDB, entonces está funcionando correctamente.

### Paso 3. Clonar el repositorio

Clona el repositorio y entra a la carpeta del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd FINCONTROL-BACKEND-SERVER
```

### Paso 4. Instalar las dependencias del proyecto

Una vez dentro de la carpeta del repositorio, instala todas las dependencias necesarias:

```bash
npm install
```

Esto descargará e instalará todos los paquetes definidos en `package.json`.

### Paso 5. Crear manualmente el archivo `.env`

El archivo `.env` no está incluido en el repositorio, por lo que debes crearlo manualmente en la raíz del proyecto.

Crea un archivo llamado:

```env
.env
```

Y agrega el siguiente contenido:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/fincontrol_db
JWT_SECRET=fincontrol_super_secret_key_2026
JWT_EXPIRES_IN=1d
```

#### Explicación de las variables

- `PORT`: puerto donde correrá el servidor.
- `MONGO_URI`: cadena de conexión local a MongoDB.
- `JWT_SECRET`: clave secreta usada para firmar los tokens JWT.
- `JWT_EXPIRES_IN`: tiempo de expiración del token.

### Paso 6. Verificar que MongoDB esté corriendo

Antes de iniciar el backend, confirma que MongoDB esté encendido.

Si MongoDB no está ejecutándose, el servidor no podrá conectarse a la base de datos y fallará al iniciar.

### Paso 7. Levantar el servidor backend

Ejecuta el proyecto en modo desarrollo con:

```bash
npm run dev
```

Si todo está configurado correctamente, deberías ver algo similar a esto en la terminal:

```text
MongoDB conectado correctamente
Servidor corriendo en http://localhost:3000
```

También puedes ejecutarlo en modo normal usando:

```bash
npm start
```

### Paso 8. Probar que el backend está vivo

Abre tu navegador o Postman y entra a:

```text
http://localhost:3000/
```

La respuesta esperada debe ser algo como:

```json
{
  "success": true,
  "message": "API de FinControl funcionando"
}
```

---

## Comandos disponibles

### Ejecutar en modo desarrollo

```bash
npm run dev
```

### Ejecutar en modo normal

```bash
npm start
```

---

## Endpoints disponibles

### Health check

**GET /**

Ejemplo:

```text
http://localhost:3000/
```

### Registro de usuario

**POST /api/auth/register**

Body:

```json
{
  "name": "Hipolito Perez",
  "email": "hipolito@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

### Inicio de sesión

**POST /api/auth/login**

Body:

```json
{
  "email": "hipolito@example.com",
  "password": "123456"
}
```

### Obtener usuario autenticado

**GET /api/auth/me**

Header:

```http
Authorization: Bearer TU_TOKEN
```

### Obtener dashboard protegido

**GET /api/dashboard**

Header:

```http
Authorization: Bearer TU_TOKEN
```

---

## Cómo probarlo con `lilfrontfortestthis.html`

Este archivo es un frontend básico de pruebas que permite validar visualmente el funcionamiento del backend.

### Qué permite hacer

- Probar `GET /`
- Registrar usuarios
- Iniciar sesión
- Guardar token
- Consultar `/api/auth/me`
- Consultar `/api/dashboard`
- Probar rutas sin token
- Probar rutas con token falso
- Hacer logout local
- Explorar respuestas exitosas y errores

### Cómo abrir `lilfrontfortestthis.html`

No se recomienda abrirlo solamente con doble clic, porque algunos navegadores pueden limitar ciertas peticiones. Lo ideal es servirlo localmente.

#### Opción 1. Usar Live Server en VS Code

1. Instala la extensión **Live Server**.
2. Haz clic derecho sobre `lilfrontfortestthis.html`.
3. Selecciona **Open with Live Server**.

#### Opción 2. Usar `serve`

Desde la raíz del proyecto ejecuta:

```bash
npx serve .
```

#### Opción 3. Usar `http-server`

Desde la raíz del proyecto ejecuta:

```bash
npx http-server
```

Después, abre en el navegador la URL local que te indique la terminal.

---

## Paso a paso para probar el backend con el frontend de prueba

1. Asegúrate de que MongoDB esté corriendo.
2. Levanta el backend.

Desde la raíz del proyecto:

```bash
npm run dev
```

3. Abre el frontend de prueba usando una de estas opciones:

```bash
npx serve .
```

O:

```bash
npx http-server
```

4. Abre `lilfrontfortestthis.html` en el navegador.
5. Verifica la **Base URL del backend**.

En la parte superior del HTML aparece un campo llamado:

```text
Base URL del backend
```

Ese valor debe ser:

```text
http://localhost:3000
```

Si está correcto, el frontend podrá comunicarse con el backend.

---

## Flujo recomendado de pruebas

### 1. Health check

Pulsa el botón:

```text
GET /
```

Esto verifica que la API está activa.

### 2. Registro válido

Pulsa:

```text
Autollenar registro válido
Registrar
```

Esto debe:

- Crear un usuario
- Devolver un token
- Guardar automáticamente el token

### 3. Consultar usuario autenticado

Pulsa:

```text
GET /api/auth/me
```

Esto debe devolver la información del usuario autenticado usando el token actual.

### 4. Consultar dashboard protegido

Pulsa:

```text
GET /api/dashboard
```

Esto debe devolver el mensaje de bienvenida y el resumen base del dashboard.

### 5. Logout

Pulsa:

```text
Logout
```

Esto elimina el token guardado localmente.

### 6. Probar ruta protegida sin token

Pulsa:

```text
GET /api/dashboard sin token
```

La respuesta esperada es un error `401`.

### 7. Login inválido

Pulsa:

```text
Autollenar login inválido
Iniciar sesión
```

La respuesta esperada es un error de credenciales inválidas.

### 8. Login válido

Usa un usuario ya registrado y pulsa:

```text
Iniciar sesión
```

Esto debe devolver un token válido.

### 9. Token falso

Pulsa:

```text
GET /api/auth/me con token falso
```

La respuesta esperada es un error `401`.

### 10. Registro duplicado

Registra dos veces el mismo correo.

La segunda vez debe devolver un error indicando que el usuario ya existe.

---

## Escenarios que permite validar el frontend de prueba

### Registro exitoso

Permite comprobar que:

- El usuario se crea correctamente
- La contraseña se procesa correctamente
- El token se genera correctamente

### Registro con datos inválidos

Permite comprobar:

- Campos vacíos
- Contraseñas diferentes
- Usuario repetido

### Login exitoso

Permite comprobar:

- Generación de JWT
- Almacenamiento local del token

### Login inválido

Permite comprobar:

- Manejo de credenciales incorrectas

### Rutas protegidas

Permite comprobar:

- Acceso con token válido
- Rechazo sin token
- Rechazo con token falso
- Rechazo con token expirado o inválido

### Logout local

Permite comprobar:

- Eliminación del token del navegador

---

## Formato general de respuestas del backend

### Respuestas exitosas

Generalmente siguen esta estructura:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {}
}
```

### Respuestas con error

Generalmente siguen esta estructura:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## Posibles errores comunes

### MongoDB no conecta

Verifica:

- Que MongoDB esté iniciado
- Que `MONGO_URI` esté correcto
- Que el archivo `.env` exista
- Que estés usando `127.0.0.1` en la conexión local

### El servidor no inicia

Verifica:

- Que ejecutaste `npm install`
- Que el archivo `.env` fue creado correctamente
- Que no falte ninguna variable de entorno

### Token inválido

Verifica:

- Que estás usando un token real
- Que el formato del header sea:

```http
Authorization: Bearer TU_TOKEN
```

### Usuario duplicado

Ocurre cuando intentas registrar un correo que ya existe en la base de datos.

### Error 404

Verifica:

- Que la ruta esté bien escrita
- Que el método HTTP sea el correcto
- Que el backend esté corriendo

---

## Estado actual del proyecto

Este backend representa la primera fase funcional del sistema FinControl. Actualmente cubre:

- Gestión de usuarios
- Autenticación
- Protección de rutas
- Dashboard inicial

En una siguiente fase podrían agregarse:

- Ingresos
- Gastos
- Categorías
- Reportes
- Metas de ahorro
- Presupuesto mensual
- Gráficas financieras

---

## Consideraciones antes de subir a GitHub

Este proyecto utiliza variables sensibles en el archivo `.env`, por lo tanto:

- No debes subir el archivo `.env`
- Debes asegurarte de que `.gitignore` incluya al menos:

```gitignore
node_modules
.env
```

De esta forma, las dependencias instaladas y las variables sensibles no se publicarán en el repositorio.

---

## Autor / responsabilidad dentro del proyecto

Este módulo corresponde a la parte de backend y autenticación del proyecto FinControl, desarrollado para soportar:

- Pantalla de registro
- Pantalla de login
- Dashboard principal

---

## Licencia

Uso académico / educativo.
