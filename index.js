const mineflayer = require('mineflayer');

const HOST = process.env.MC_HOST || '144.31.46.4';
const PORT = parseInt(process.env.MC_PORT || '10167');
const USERNAME = process.env.MC_USERNAME || 'geforce';
const RECONNECT_DELAY = parseInt(process.env.RECONNECT_DELAY || '30000'); // 30 segundos

let bot = null;
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

  log(`Conectando ao servidor ${HOST}:${PORT} como "${USERNAME}"...`);

  try {
    bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: USERNAME,
      version: false, // detecta automaticamente a versão
      hideErrors: false,
      checkTimeoutInterval: 60000,
      connectTimeout: 30000,
    });

    bot.on('login', () => {
      log(`✅ Bot conectado com sucesso! Jogador: ${bot.username}`);
    });

    bot.on('spawn', () => {
      log('🌍 Bot entrou no mundo. Modo AFK ativado.');
      startAFK();
    });

    bot.on('kicked', (reason) => {
      log(`⚠️  Bot foi kickado: ${reason}`);
      scheduleReconnect();
    });

    bot.on('error', (err) => {
      log(`❌ Erro de conexão: ${err.message}`);
      scheduleReconnect();
    });

    bot.on('end', (reason) => {
      log(`🔌 Conexão encerrada: ${reason || 'sem motivo'}`);
      scheduleReconnect();
    });

    bot.on('death', () => {
      log('💀 Bot morreu. Tentando respawnar...');
      bot.respawn();
    });

    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      log(`💬 [Chat] ${username}: ${message}`);
    });

  } catch (err) {
    log(`❌ Falha ao criar bot: ${err.message}`);
    scheduleReconnect();
  }
}

function startAFK() {
  // Movimento leve para evitar kick por inatividade (olha para os lados)
  setInterval(() => {
    if (bot && bot.entity) {
      const yaw = bot.entity.yaw + 0.01;
      bot.look(yaw, bot.entity.pitch, false);
    }
  }, 10000);
}

function scheduleReconnect() {
  if (reconnectTimer) return; // já agendado

  log(`🔄 Tentando reconectar em ${RECONNECT_DELAY / 1000} segundos...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (bot) {
      try { bot.end(); } catch (_) {}
      bot = null;
    }
    createBot();
  }, RECONNECT_DELAY);
}

// Iniciar o bot
log('🚀 Iniciando bot AFK Minecraft...');
log(`   Servidor : ${HOST}:${PORT}`);
log(`   Username : ${USERNAME}`);
log(`   Reconexão: a cada ${RECONNECT_DELAY / 1000}s quando offline`);
createBot();
