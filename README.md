# FinControl - Frontend

## 1. Tecnologías Utilizadas
El proyecto ha sido desarrollado utilizando un stack frontend moderno y optimizado para alto rendimiento y control total del diseño sin dependencias innecesarias:

- **Core / Motor:** React
- **Entorno de Desarrollo:** Vite
- **Enrutamiento:** React Router DOM
- **Estilos (UI/UX):** Vanilla CSS
- **Animaciones:** Framer Motion
- **Íconos:** Lucide React

## 2. Descripción de Pantallas y Funcionalidades

### A. Pantalla de Inicio de Sesión (Login - `/login`)
- **Estructura:** Diseño "Split-screen" (pantalla dividida horizontalmente en escritorio). El panel curvo izquierdo presenta la identidad de la marca (Navy Blue), la promesa de valor y "Social Proof" (Opiniones de clientes).
- **Funcionalidad:** Panel derecho con el formulario interactivo de autenticación que incluye validación del Email y Contraseña, un icono alternador (Ojo) para ocultar la clave y checkbox de "Recordar este dispositivo". Botón principal redondeado interactivo animado.

### B. Pantalla de Registro (Register - `/register`)
- **Estructura:** Comparte la consistencia visual y diseño de contenedores con la pantalla de acceso.
- **Formulario:** Captura de datos estructurada con campos para: Nombre Completo, Correo Electrónico, Contraseña y Confirmación de Contraseña.

### C. Ventana Modal (Pop-up de "Términos y Privacidad")
- **Funcionalidad Animada:** Cuando el usuario hace clic en los enlaces de "Términos de Servicio" o "Política de Privacidad" de la pantalla de Registro, se ejecuta un Overlay que oscurece el fondo.
- **Construcción:** Surge desde el centro de la pantalla escalando con aceleración por hardware (Framer Motion). Incluye la iconografía corporativa y un mensaje amable indicando que "el apartado de servicio se encuentra actualmente en desarrollo y redacción". Contiene un botón central de cierre y una "X" superior de accionamiento rápido.

### D. Panel de Control y Tablero Informativo (Dashboard - `/dashboard`)
- **Estructura Base:** Interfaz compuesta por una barra lateral minimalista de navegación interna (Sidebar) con un logotipo vectorial modificado.
- **Cabecera de Interfaz:** Barra superior inteligente con input de text search dinámico tipo "Píldora", iconos de "Feedback/Ayuda", icono de Notificaciones animado y visualización contextual del Perfil del usuario autenticado ("Jose").
- **Visualización de Datos:** Tarjetas (Cards) con métricas analíticas. Una tarjeta en Tema Oscuro (Balance Total) y dos tarjetas flotantes con progreso en coloración Semántica (Dinero "Depositado" en verde, y "Retirado" en Rojo, con sus respectivas micro-barras de progreso).
- **Operaciones:** Lista dinámica inferior de "Transacciones Recientes" identificadas por comercio (Por ej. Apple Store, Restaurantes) y el volumen monetario en formato RD$.
- **Proyección de Ahorro:** Módulo integral "Metas Futuras", con barras de progreso segmentadas individualmente hacia un nivel monetario techo (Viaje a Japón, Pago Inicial, Fondo de Emergencia).

## 3. Guía de Ejecución Local (Cómo iniciar el proyecto)
Instrucciones exactas sobre cómo cualquier evaluador de este sistema debe arrancarlo de cero:

- **Requisito previo:** Confirmar que se tiene instalado Node.js de forma global en el equipo (se puede verificar abriendo una terminal y ejecutando `node -v`).
- **Preparar el entorno:** Descargar o clonar la carpeta contenedora del código llamada `Fincontrol`.
- **Acceso e instalación:** Abrir una Terminal (Consola de comandos, Powershell bash) sobre la carpeta de `Fincontrol`. Instalar las piezas de desarrollo (dependencias de React, Vite, Framer, etc.) mediante el siguiente comando:
  ```bash
  npm install
  ```
- **Iniciar el proyecto (Levantar el Servidor):** Con la instalación completada exitosamente, escribir el comando de inicio de sistema en desarrollo:
  ```bash
  npm run dev
  ```
- **Abrir plataforma en el Navegador:** Vite mostrará un puerto local (usualmente `http://localhost:5173/`). Solo hay que dar CTRL + Click en él (o escribirlo directamente en el menú de direcciones de Chrome, Edge, Safari, Brave...) para empezar la experiencia.
