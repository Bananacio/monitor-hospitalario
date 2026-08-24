const socket = io();

const bpmDisplay = document.getElementById('bpm-display');
const estadoDisplay = document.getElementById('estado-display');
const listaAlertas = document.getElementById('lista-alertas');

// Escuchar evento de alerta enviado desde el servidor
socket.on('nueva-alerta', (data) => {
  console.log('Alerta recibida:', data);

  // 1. Actualizar el indicador principal
  bpmDisplay.innerText = `${data.ritmo} BPM`;
  estadoDisplay.innerText = `Estado: ${data.estado.toUpperCase()} (${data.timestamp})`;

  // 2. Crear un nuevo elemento en el historial
  const tarjetaAlerta = document.createElement('div');
  tarjetaAlerta.classList.add('tarjeta-alerta', data.estado.toLowerCase());

  tarjetaAlerta.innerHTML = `
    <span class="hora">${data.timestamp}</span>
    <span class="ritmo">${data.ritmo} BPM</span>
    <span class="mensaje">${data.mensaje}</span>
  `;

  // Insertar al inicio de la lista
  listaAlertas.prepend(tarjetaAlerta);
});