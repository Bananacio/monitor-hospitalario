# 🏥 Monitor Hospitalario de Ritmo Cardíaco

Sistema de monitoreo de ritmo cardíaco en tiempo real impulsado por **ESP32**, **Raspberry Pi** y una plataforma web desarrollada en **Node.js** y **Express** con comunicación bi-direccional en tiempo real vía **WebSockets**.

---

## 🚀 Arquitectura del Sistema

1. **ESP32 / Sensores**: Captura las lecturas del ritmo cardíaco y las transmite.
2. **Raspberry Pi**: Procesa las métricas recibidas y envía peticiones HTTP al servidor web al detectar anomalías.
3. **Servidor Node.js & Socket.io**: Recibe las alertas y las remite mediante WebSockets a todos los clientes conectados.
4. **Interfaz Web**: Muestra los BPM y el historial de alertas clasificadas por severidad sin necesidad de recargar la página.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hardware / IoT**: ESP32, Raspberry Pi (Python)

---

## 💻 Instalación y Uso Local

### Prerrequisitos
- Node.js (v18 o superior)
- npm

### Pasos para ejecutar

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/shamiramicaelaleiva-create/monitor-hospitalario.git](https://github.com/shamiramicaelaleiva-create/monitor-hospitalario.git)
   cd monitor-hospitalario
