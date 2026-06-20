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
      offline: true // Servidores Bedrock geralmente aceitam conexões offline/locais
    });

    client.on('join', () => {
      log(`✅ Bot entrou no servidor Bedrock com sucesso!`);
    });

    client.on('spawn', () => {
      log('🌍 Bot deu spawn no mundo.');
    });

    client.on('error', (err) => {
      log(`❌ Erro de conexão: ${err.message}`);
      scheduleReconnect();
    });

    client.on('close', () => {
      log(`🔌 Conexão encerrada.`);
      scheduleReconnect();
    });

    client.on('kick', (reason) => {
      log(`⚠️ Bot foi kickado: ${reason}`);
      scheduleReconnect();
    });

    // Manter a conexão ativa enviando pacotes de movimento simples se necessário
    setInterval(() => {
        if (client && client.status === 'active') {
            // Bedrock protocol handles keep-alive automatically, 
            // but we can log status here if needed
        }
    }, 60000);

  } catch (err) {
    log(`❌ Falha ao criar cliente Bedrock: ${err.message}`);
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

log('🚀 Iniciando bot AFK Minecraft BEDROCK...');
log(`   Servidor : ${HOST}:${PORT}`);
log(`   Username : ${USERNAME}`);
createBot();
