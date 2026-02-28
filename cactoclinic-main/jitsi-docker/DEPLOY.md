# 🚀 Guia de Deploy - Jitsi Meet em Servidor

Este guia explica como fazer o deploy do Jitsi Meet em um servidor de produção.

## 📋 Pré-requisitos do Servidor

- **Sistema Operacional**: Ubuntu 20.04+ ou Debian 10+ (recomendado)
- **RAM**: Mínimo 2GB (recomendado 4GB+)
- **CPU**: Mínimo 2 cores
- **Disco**: Mínimo 20GB de espaço livre
- **Rede**: IP público estático
- **Domínio**: Domínio configurado com DNS

## 🔧 Passo 1: Preparar o Servidor

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Docker

```bash
# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar:
newgrp docker
```

### 1.3 Instalar Docker Compose (se não estiver incluído)

```bash
sudo apt install -y docker-compose-plugin
```

### 1.4 Configurar Firewall

```bash
# Instalar UFW (se não estiver instalado)
sudo apt install -y ufw

# Permitir portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 10000/udp # JVB (Video Bridge)
sudo ufw allow 4443/tcp  # JVB TCP

# Habilitar firewall
sudo ufw enable
```

## 🌐 Passo 2: Configurar DNS

### 2.1 Configurar registro DNS

No seu provedor de DNS (ex: Cloudflare, Route53, etc.), adicione:

```
Tipo: A
Nome: meet (ou subdomínio desejado)
Valor: IP_DO_SEU_SERVIDOR
TTL: 3600
```

Exemplo: `meet.seudominio.com.br` → `123.456.789.0`

### 2.2 Verificar DNS

```bash
# Verificar se o DNS está resolvendo corretamente
dig meet.seudominio.com.br
# ou
nslookup meet.seudominio.com.br
```

## 📦 Passo 3: Instalar Jitsi Meet

### 3.1 Clonar repositório

```bash
cd /opt
sudo git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
sudo chown -R $USER:$USER .
```

### 3.2 Criar diretório de configuração

```bash
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

### 3.3 Configurar variáveis de ambiente

```bash
cp env.example .env
nano .env  # ou use seu editor preferido
```

Configure o arquivo `.env`:

```env
# Domínio público
PUBLIC_URL=https://meet.seudominio.com.br

# SSL/HTTPS
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.seudominio.com.br
LETSENCRYPT_EMAIL=seu-email@seudominio.com.br
DISABLE_HTTPS=0
ENABLE_HTTP_REDIRECT=1

# Desabilitar pré-join page
ENABLE_PREJOIN_PAGE=0
ENABLE_WELCOME_PAGE=0
ENABLE_CLOSE_PAGE=0

# Outras configurações
ENABLE_AUTH=0
ENABLE_GUESTS=1
ENABLE_RECORDING=0
ENABLE_TRANSCRIPTIONS=0
ENABLE_WATERMARK=0
ENABLE_BRAND_WATERMARK=0

# Timezone
TZ=America/Sao_Paulo
```

### 3.4 Gerar senhas

```bash
chmod +x gen-passwords.sh
./gen-passwords.sh
```

### 3.5 Iniciar containers

```bash
docker compose up -d
```

### 3.6 Verificar status

```bash
docker compose ps
docker compose logs -f
```

## 🔒 Passo 4: Configurações de Segurança

### 4.1 Desabilitar pré-join page

Edite o arquivo de configuração:

```bash
nano ~/.jitsi-meet-cfg/web/config.js
```

Adicione ou modifique:

```javascript
config.prejoinPageEnabled = false;
config.skipPrejoinPage = true;
config.enableWelcomePage = false;
config.enableClosePage = false;
```

Reinicie o container web:

```bash
docker compose restart web
```

### 4.2 Configurar rate limiting (opcional)

Para proteger contra abuso, configure rate limiting no nginx ou use um proxy reverso.

## 🔄 Passo 5: Atualização e Manutenção

### 5.1 Atualizar Jitsi Meet

```bash
cd /opt/docker-jitsi-meet
docker compose pull
docker compose up -d
```

### 5.2 Backup de configurações

```bash
# Criar backup
tar -czf jitsi-backup-$(date +%Y%m%d).tar.gz ~/.jitsi-meet-cfg

# Restaurar backup
tar -xzf jitsi-backup-YYYYMMDD.tar.gz -C ~/
```

### 5.3 Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver logs
docker compose logs -f web
docker compose logs -f jvb
```

## 🔗 Passo 6: Integrar com a Aplicação

Após configurar o Jitsi Meet no servidor, atualize o código da aplicação:

```typescript
// Em src/pages/Consulta.tsx
const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'https://meet.seudominio.com.br';

const generateMeetingLink = () => {
  const roomName = "CactoSaude";
  setMeetingRoomName(roomName);
  const link = `${JITSI_DOMAIN}/${roomName}`;
  setMeetingLink(link);
  return link;
};
```

Crie arquivo `.env` na raiz do projeto:

```env
VITE_JITSI_DOMAIN=https://meet.seudominio.com.br
```

## 📊 Passo 7: Otimizações de Performance

### 7.1 Ajustar recursos do Docker

Edite `docker-compose.yml` e adicione limites de recursos:

```yaml
services:
  jvb:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 7.2 Configurar STUN/TURN (para NAT)

Se tiver problemas de conectividade, configure servidores STUN/TURN externos.

## 🐛 Troubleshooting

### Problema: SSL não funciona
- Verifique se o DNS está apontando corretamente
- Verifique se a porta 443 está aberta
- Verifique os logs: `docker compose logs web`

### Problema: Vídeo não funciona
- Verifique se a porta UDP 10000 está aberta
- Verifique os logs do JVB: `docker compose logs jvb`

### Problema: Containers não iniciam
- Verifique se as portas estão disponíveis
- Verifique os logs: `docker compose logs`

## 📚 Recursos Adicionais

- [Documentação Oficial Jitsi](https://jitsi.github.io/handbook/)
- [Jitsi Docker GitHub](https://github.com/jitsi/docker-jitsi-meet)
- [Comunidade Jitsi](https://community.jitsi.org/)

