# 🚀 Guia Rápido - Jitsi Meet com Docker

## Instalação Local (5 minutos)

### 1. Pré-requisitos
- Docker instalado
- Docker Compose instalado

### 2. Configuração Rápida

```bash
# 1. Clone o repositório oficial
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet

# 2. Crie o diretório de configuração
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}

# 3. Copie e configure o .env
cp env.example .env

# 4. Edite o .env (mínimo necessário)
# PUBLIC_URL=localhost
# ENABLE_PREJOIN_PAGE=0
# ENABLE_WELCOME_PAGE=0
# ENABLE_CLOSE_PAGE=0

# 5. Gere as senhas
chmod +x gen-passwords.sh
./gen-passwords.sh

# 6. Inicie os containers
docker compose up -d

# 7. Acesse
# http://localhost
```

### 3. Desabilitar Pré-join Page

Após iniciar, edite o arquivo de configuração:

```bash
nano ~/.jitsi-meet-cfg/web/config.js
```

Adicione:

```javascript
config.prejoinPageEnabled = false;
config.skipPrejoinPage = true;
```

Reinicie:

```bash
docker compose restart web
```

## Deploy em Servidor

### 1. No servidor, execute:

```bash
# Instalar Docker (se necessário)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Clone e configure (mesmos passos acima)
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
cp env.example .env
```

### 2. Configure o .env para produção:

```env
PUBLIC_URL=https://meet.seudominio.com.br
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.seudominio.com.br
LETSENCRYPT_EMAIL=seu-email@seudominio.com.br
ENABLE_PREJOIN_PAGE=0
ENABLE_WELCOME_PAGE=0
ENABLE_CLOSE_PAGE=0
```

### 3. Configure DNS

No seu provedor de DNS, adicione registro A:
- Nome: `meet`
- Tipo: `A`
- Valor: IP do servidor

### 4. Inicie:

```bash
./gen-passwords.sh
docker compose up -d
```

## Integração com a Aplicação

Após configurar o Jitsi, crie arquivo `.env` na raiz do projeto React:

```env
VITE_JITSI_DOMAIN=https://meet.seudominio.com.br
```

O código já está preparado para usar essa variável!

## Comandos Úteis

```bash
# Ver logs
docker compose logs -f

# Parar
docker compose down

# Reiniciar
docker compose restart

# Atualizar
docker compose pull
docker compose up -d
```

