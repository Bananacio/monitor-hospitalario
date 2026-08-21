let graficoBPM = null;
let datosGlobales = {};
let alertasHistorial = [];
let pacienteDesplegadoId = null;

document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
        document.getElementById("reloj").innerText = new Date().toLocaleTimeString('es-AR');
    }, 1000);

    const ctx = document.getElementById('graficoBPM').getContext('2d');
    graficoBPM = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 20}, (_, i) => `-${20 - i}s`),
            datasets: [
                { label: 'Paciente 1 (Gómez)', borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', data: [], tension: 0.4, fill: true },
                { label: 'Paciente 2 (Rodríguez)', borderColor: '#F87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', data: [], tension: 0.4, fill: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94A3B8' } }
            },
            scales: {
                y: { min: 40, max: 140, grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } }
            }
        }
    });

    actualizarInterfaz();
    setInterval(actualizarInterfaz, 2000);
});

function cambiarModulo(idModulo, event) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    document.getElementById(`modulo-${idModulo}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

async function actualizarInterfaz() {
    try {
        const res = await fetch('/api/datos');
        datosGlobales = await res.json();

        procesarAlertas();
        renderizarPacientesHabitacion();

        if (pacienteDesplegadoId) {
            renderizarFichaDetalle(pacienteDesplegadoId);
        }

        graficoBPM.data.datasets[0].data = datosGlobales["1"].historial;
        graficoBPM.data.datasets[1].data = datosGlobales["2"].historial;
        graficoBPM.update();

    } catch (err) {
        console.error("Error al actualizar la interfaz:", err);
    }
}

function procesarAlertas() {
    const tablaBody = document.getElementById('tabla-alertas-body');
    
    Object.keys(datosGlobales).forEach(id => {
        const p = datosGlobales[id];
        const hora = new Date().toLocaleTimeString('es-AR');

        if (p.estadoBpm !== 'NORMAL') {
            const existe = alertasHistorial.some(a => a.id === id && a.tipo === p.estadoBpm && (Date.now() - a.timestamp < 10000));
            if (!existe) {
                alertasHistorial.unshift({
                    hora,
                    habitacion: 'Habitación 32',
                    paciente: `${p.paciente} ${p.apellido}`,
                    tipo: p.estadoBpm,
                    valor: `${p.bpmActual} BPM`,
                    timestamp: Date.now(),
                    id
                });
            }
        }
    });

    if (alertasHistorial.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5" class="text-center">Sin alertas recientes registradas.</td></tr>`;
    } else {
        tablaBody.innerHTML = alertasHistorial.slice(0, 5).map(a => `
            <tr>
                <td>${a.hora}</td>
                <td><strong>${a.habitacion}</strong></td>
                <td>${a.paciente}</td>
                <td><span class="status-pill status-alerta">${a.tipo}</span></td>
                <td><strong>${a.valor}</strong></td>
            </tr>
        `).join('');
    }
}

function renderizarPacientesHabitacion() {
    const contenedor = document.getElementById('contenedor-pacientes-hab32');
    if (!contenedor || !datosGlobales["1"]) return;

    contenedor.innerHTML = '';

    Object.keys(datosGlobales).forEach(id => {
        const p = datosGlobales[id];
        let classBpm = p.estadoBpm === 'NORMAL' ? 'status-normal' : 'status-alerta';

        contenedor.innerHTML += `
            <div class="paciente-card-resumen" onclick="desplegarFichaCompleta('${id}')">
                <div class="paciente-resumen-header">
                    <h3>${p.paciente} ${p.apellido}</h3>
                    <span class="status-pill ${classBpm}">${p.estadoBpm}</span>
                </div>
                <p style="font-size:0.8rem; color:#94A3B8;"><strong>Diagnóstico:</strong> ${p.motivo}</p>
                <div class="resumen-grid-datos" style="grid-template-columns: 1fr;">
                    <div class="data-box"><label>Frecuencia Cardíaca</label><span>${p.bpmActual} BPM</span></div>
                </div>
                <button class="btn-ver-mas">👁️ Ver Ficha Completa</button>
            </div>
        `;
    });
}

function desplegarFichaCompleta(id) {
    pacienteDesplegadoId = id;
    const panel = document.getElementById('panel-ficha-completa');
    panel.classList.remove('oculto');
    renderizarFichaDetalle(id);
    panel.scrollIntoView({ behavior: 'smooth' });
}

function cerrarFichaCompleta() {
    pacienteDesplegadoId = null;
    document.getElementById('panel-ficha-completa').classList.add('oculto');
}

function renderizarFichaDetalle(id) {
    const p = datosGlobales[id];
    if (!p) return;

    document.getElementById('ficha-nombre-paciente').innerText = `Ficha Completa: ${p.paciente} ${p.apellido} (Hab. 32)`;
    let classBpm = p.estadoBpm === 'NORMAL' ? 'status-normal' : 'status-alerta';

    document.getElementById('contenido-ficha-detalle').innerHTML = `
        <div class="patient-data-grid">
            <div class="data-box"><label>Edad / Género</label><span>${p.edad} años (${p.genero})</span></div>
            <div class="data-box"><label>Médico a Cargo</label><span>${p.medico}</span></div>
            <div class="data-box"><label>Alergias</label><span>${p.alergias}</span></div>
            <div class="data-box"><label>Fecha Internación</label><span>${p.fechaIngreso}</span></div>
            <div class="data-box"><label>Alta Estimada</label><span>${p.fechaAlta}</span></div>
            <div class="data-box"><label>Estado Pulso</label><span class="status-pill ${classBpm}">${p.estadoBpm} (${p.bpmActual} BPM)</span></div>
        </div>

        <div class="sim-card">
            <h4 style="font-size:0.9rem; margin-bottom:10px;">🧪 Simular Frecuencia Cardíaca para ${p.paciente}</h4>
            <div class="sim-grid">
                <div>
                    <label>Ritmo Cardíaco:</label>
                    <div class="btn-group">
                        <button class="btn btn-danger" onclick="simular('${id}', 120)">Taquicardia (120 BPM)</button>
                        <button class="btn btn-warning" onclick="simular('${id}', 48)">Bradicardia (48 BPM)</button>
                        <button class="btn btn-success" onclick="simular('${id}', 75)">Normal (75 BPM)</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function simular(pacienteId, bpm) {
    await fetch('/api/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: pacienteId, bpm })
    });
    actualizarInterfaz();
}

async function reiniciarSimulacion() {
    await fetch('/api/reiniciar', { method: 'POST' });
    actualizarInterfaz();
}