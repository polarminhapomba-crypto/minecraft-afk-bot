const bedrock = require('bedrock-protocol');

const HOST = process.env.MC_HOST || '144.31.46.4';
const PORT = parseInt(process.env.MC_PORT || '10167');
const USERNAME = process.env.MC_USERNAME || 'geforce';
const RECONNECT_DELAY = parseInt(process.env.RECONNECT_DELAY || '30000');

let client = null;
let reconnectTimer = null;

function log(msg) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${msg}`);
}

function createBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  log(`Conectando ao servidor BEDROCK ${HOST}:${PORT} como "${USERNAME}"...`);

  try {
    client = bedrock.createClient({
      host: HOST,
      port: PORT,
      username: USERNAME,
      offline: true,
      version: '1.26.30' // Forçar a versão que detectamos
    });

    client.on('join', () => {
      log(`✅ Bot entrou no servidor Bedrock com sucesso!`);
    });

    client.on('spawn', () => {
      log('🌍 Bot deu spawn no mundo.');
    });

    client.on('error', (err) => {
      log(`❌ Erro de conexão: ${err.message || err}`);
      scheduleReconnect();
    });

    client.on('close', () => {
      log(`🔌 Conexão encerrada.`);
      scheduleReconnect();
    });

    client.on('kick', (reason) => {
      // Tentar extrair o motivo do kick de forma legível
      let kickReason = reason;
      if (typeof reason === 'object') {
        try {
          kickReason = JSON.stringify(reason);
        } catch (e) {
          kickReason = 'Motivo complexo (verifique whitelist/versão)';
        }
      }
      log(`⚠️ Bot foi kickado pelo servidor: ${kickReason}`);
      scheduleReconnect();
    });

    client.on('disconnect', (packet) => {
      log(`🚫 Desconectado: ${JSON.stringify(packet.reason || packet)}`);
      scheduleReconnect();
    });

  } catch (err) {
    log(`❌ Falha crítica ao criar cliente: ${err.message}`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  log(`🔄 Tentando reconectar em ${RECONNECT_DELAY / 1000} segundos...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (client) {
      try { client.close(); } catch (_) {}
      client = null;
    }
    createBot();
  }, RECONNECT_DELAY);
}

// Prevenir que o processo morra por erros não capturados (o erro fatal do print)
process.on('uncaughtException', (err) => {
  log(`🔥 Erro não capturado (evitando crash): ${err.message}`);
  scheduleReconnect();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`🔥 Rejeição não tratada: ${reason}`);
  scheduleReconnect();
});

log('🚀 Iniciando bot AFK Minecraft BEDROCK (v1.26.30)...');
log(`   Servidor : ${HOST}:${PORT}`);
log(`   Username : ${USERNAME}`);
createBot();
