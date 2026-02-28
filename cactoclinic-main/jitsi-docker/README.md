# Jitsi Meet - Instalação com Docker

Este guia explica como instalar e configurar o Jitsi Meet usando Docker, tanto localmente quanto em um servidor de produção.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 1.29 ou superior)
- Portas disponíveis: 80, 443, 10000 (UDP), 4443 (UDP)
- Para produção: Domínio configurado com DNS apontando para o servidor

## 🚀 Instalação Local (Desenvolvimento)

### Passo 1: Clonar o repositório oficial

```bash
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
```

### Passo 2: Criar diretório de configuração

```bash
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

### Passo 3: Configurar variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp env.example .env
```

2. Edite o arquivo `.env` com as seguintes configurações:

```env
# Domínio público (para local use localhost ou seu IP local)
PUBLIC_URL=localhost

# Configurações de segurança
ENABLE_AUTH=false
ENABLE_GUESTS=true
ENABLE_RECORDING=false
ENABLE_TRANSCRIPTIONS=false
ENABLE_WELCOME_PAGE=false
ENABLE_CLOSE_PAGE=false
ENABLE_PREJOIN_PAGE=false

# Configurações de vídeo
ENABLE_LOBBY=false
ENABLE_BREAKOUT_ROOMS=false

# Configurações de áudio
ENABLE_NO_AUDIO_DETECTION=false
ENABLE_NOISY_MIC_DETECTION=false

# Configurações de interface
ENABLE_WATERMARK=false
ENABLE_BRAND_WATERMARK=false
```

### Passo 4: Gerar senhas seguras

```bash
./gen-passwords.sh
```

Este script gera senhas aleatórias para os serviços internos do Jitsi.

### Passo 5: Iniciar os containers

```bash
docker-compose up -d
```

### Passo 6: Acessar o Jitsi Meet

Abra seu navegador e acesse:
- **Local**: `http://localhost`
- **Rede local**: `http://SEU_IP_LOCAL`

## 🌐 Instalação em Servidor (Produção)

### Passo 1: Preparar o servidor

1. Instale Docker e Docker Compose no servidor
2. Configure o DNS do seu domínio para apontar para o IP do servidor
3. Configure o firewall para permitir as portas necessárias

### Passo 2: Configurar SSL/HTTPS

No arquivo `.env`, configure:

```env
PUBLIC_URL=https://meet.seudominio.com.br
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.seudominio.com.br
LETSENCRYPT_EMAIL=seu-email@seudominio.com.br
```

### Passo 3: Ajustar configurações de produção

```env
# Desabilitar recursos não essenciais para melhor performance
ENABLE_RECORDING=false
ENABLE_TRANSCRIPTIONS=false
ENABLE_BREAKOUT_ROOMS=false

# Habilitar autenticação se necessário
ENABLE_AUTH=true
AUTH_TYPE=internal
```

### Passo 4: Iniciar os serviços

```bash
docker-compose up -d
```

### Passo 5: Verificar logs

```bash
docker-compose logs -f
```

## 🔧 Configuração Avançada

### Desabilitar pré-join page completamente

Edite `~/.jitsi-meet-cfg/web/config.js` e adicione:

```javascript
config.prejoinPageEnabled = false;
config.skipPrejoinPage = true;
```

### Personalizar interface

Edite `~/.jitsi-meet-cfg/web/interface_config.js` para personalizar a interface.

## 📝 Comandos Úteis

```bash
# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart

# Ver logs
docker-compose logs -f

# Atualizar Jitsi Meet
docker-compose pull
docker-compose up -d

# Limpar tudo (CUIDADO: remove todos os dados)
docker-compose down -v
```

## 🔒 Segurança

1. **Firewall**: Configure apenas as portas necessárias
2. **SSL**: Sempre use HTTPS em produção
3. **Senhas**: Use senhas fortes geradas pelo `gen-passwords.sh`
4. **Atualizações**: Mantenha os containers atualizados

## 🐛 Troubleshooting

### Problema: Containers não iniciam
- Verifique se as portas estão disponíveis
- Verifique os logs: `docker-compose logs`

### Problema: Não consigo acessar
- Verifique o firewall
- Verifique se o DNS está configurado corretamente
- Verifique os logs do container web

### Problema: SSL não funciona
- Verifique se o domínio está apontando para o servidor
- Verifique os logs do Let's Encrypt: `docker-compose logs web`

## 📚 Documentação Oficial

- [Jitsi Meet Docker](https://github.com/jitsi/docker-jitsi-meet)
- [Jitsi Meet Documentation](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker)

## 🔗 Integração com a Aplicação

Após configurar o Jitsi Meet, você precisará atualizar a URL no código:

```typescript
// Em vez de: https://meet.jit.si/CactoSaude
// Use: https://meet.seudominio.com.br/CactoSaude
```

