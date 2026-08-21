const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const TELEGRAM_TOKEN = "TU_TOKEN_COMPLETO_DE_BOTFATHER";
const CHAT_ID = "-5535711670";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ESTADO_INICIAL = () => ({
    "1": { 
        habitacion: "104", 
        paciente: "Paciente 1", 
        apellido: "Gómez", 
        edad: 58,
        genero: "Masculino",
        medico: "Dr. James Smith",
        fechaIngreso: "02/08/2026",
        fechaAlta: "15/08/2026",
        motivo: "Insuficiencia Cardíaca Aguda", 
        alergias: "Penicilina",
        bpmActual: 75, 
        presionSistolica: 120,
        presionDiastolica: 80,
        estadoPresion: "NORMAL",
        historial: [75], 
        estadoBpm: "NORMAL", 
        ultimoEnvio: 0 
    },
    "2": { 
        habitacion: "104", 
        paciente: "Paciente 2", 
        apellido: "Rodríguez", 
        edad: 64,
        genero: "Femenino",
        medico: "Dra. Elena Rossi",
        fechaIngreso: "08/08/2026",
        fechaAlta: "Sin definir (En observación)",
        motivo: "Postoperatorio Cirugía Torácica", 
        alergias: "Ninguna",
        bpmActual: 72, 
        presionSistolica: 118,
        presionDiastolica: 78,
        estadoPresion: "NORMAL",
        historial: [72], 
        estadoBpm: "NORMAL", 
        ultimoEnvio: 0 
    }
});

let pacientes = ESTADO_INICIAL();
const TIEMPO_COOLDOWN = 120000;

async function enviarTelegram(mensaje) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: mensaje, parse_mode: 'Markdown' })
        });
    } catch (error) {
        console.error("Error enviando a Telegram:", error);
    }
}

function procesarLectura(id, bpm, sistolica, diastolica) {
    const p = pacientes[id];
    if (!p) return;

    if (bpm) {
        p.bpmActual = bpm;
        p.historial.push(bpm);
        if (p.historial.length > 20) p.historial.shift();
    }

    if (sistolica && diastolica) {
        p.presionSistolica = sistolica;
        p.presionDiastolica = diastolica;
        
        if (sistolica < 90 || diastolica < 60) {
            p.estadoPresion = "BAJA (Hipotensión)";
        } else if (sistolica > 130 || diastolica > 85) {
            p.estadoPresion = "ELEVADA (Hipertensión)";
        } else {
            p.estadoPresion = "NORMAL";
        }
    }

    const ahora = Date.now();
    const estadoBpmPrevio = p.estadoBpm;
    let estadoBpmActual = "NORMAL";

    if (p.bpmActual < 60) estadoBpmActual = "BRADICARDIA";
    else if (p.bpmActual > 100) estadoBpmActual = "TAQUICARDIA";

    if (estadoBpmActual !== "NORMAL") {
        if (estadoBpmPrevio !== estadoBpmActual || (ahora - p.ultimoEnvio > TIEMPO_COOLDOWN)) {
            const msg = `🚨 *ALERTA MÉDICA*\n📍 *Hab:* ${p.habitacion} | *${p.paciente} ${p.apellido}*\n💓 *BPM:* ${p.bpmActual} (${estadoBpmActual})\n🩺 *Presión:* ${p.presionSistolica}/${p.presionDiastolica} mmHg (${p.estadoPresion})`;
            enviarTelegram(msg);
            p.ultimoEnvio = ahora;
            p.estadoBpm = estadoBpmActual;
        }
    } else if (estadoBpmActual === "NORMAL" && estadoBpmPrevio !== "NORMAL") {
        const msg = `✅ *PACIENTE ESTABILIZADO*\n📍 *Hab:* ${p.habitacion} | *${p.paciente} ${p.apellido}*\n💓 *BPM:* ${p.bpmActual} (Normal)`;
        enviarTelegram(msg);
        p.estadoBpm = "NORMAL";
    }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/api/datos', (req, res) => res.json(pacientes));

app.post('/api/actualizar', (req, res) => {
    const { paciente_id, bpm, sistolica, diastolica } = req.body;
    procesarLectura(paciente_id, bpm, sistolica, diastolica);
    res.json({ status: "ok" });
});

app.post('/api/reiniciar', (req, res) => {
    pacientes = ESTADO_INICIAL();
    res.json({ status: "ok", message: "Simulación reiniciada" });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));