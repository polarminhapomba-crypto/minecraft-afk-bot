# Minecraft AFK Bot

Bot AFK para manter servidor Minecraft ativo 24/7 com reconexão automática.

## Configuração

Variáveis de ambiente (opcionais, já com valores padrão):

| Variável | Padrão | Descrição |
|---|---|---|
| `MC_HOST` | `144.31.46.4` | IP do servidor |
| `MC_PORT` | `10167` | Porta do servidor |
| `MC_USERNAME` | `geforce` | Nome do bot |
| `RECONNECT_DELAY` | `30000` | Delay de reconexão em ms |

## Como rodar localmente

```bash
npm install
npm start
```

## Deploy no Railway

Este projeto está configurado para rodar como **worker** no Railway via `Procfile`.
