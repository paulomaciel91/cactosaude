#!/bin/bash

# Script para gerar senhas aleatórias para o Jitsi Meet
# Execute este script antes de iniciar os containers pela primeira vez

# Função para gerar senha aleatória
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Por favor, copie o arquivo .env.example para .env primeiro:"
    echo "  cp .env.example .env"
    exit 1
fi

echo "🔐 Gerando senhas seguras para o Jitsi Meet..."

# Gerar senhas
JICOFO_AUTH_PASSWORD=$(generate_password)
JVB_AUTH_PASSWORD=$(generate_password)
JIGASI_XMPP_PASSWORD=$(generate_password)
JIBRI_XMPP_PASSWORD=$(generate_password)
JIBRI_RECORDER_PASSWORD=$(generate_password)

# Atualizar arquivo .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^JICOFO_AUTH_PASSWORD=.*/JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}/" .env
    sed -i '' "s/^JVB_AUTH_PASSWORD=.*/JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}/" .env
    sed -i '' "s/^JIGASI_XMPP_PASSWORD=.*/JIGASI_XMPP_PASSWORD=${JIGASI_XMPP_PASSWORD}/" .env
    sed -i '' "s/^JIBRI_XMPP_PASSWORD=.*/JIBRI_XMPP_PASSWORD=${JIBRI_XMPP_PASSWORD}/" .env
    sed -i '' "s/^JIBRI_RECORDER_PASSWORD=.*/JIBRI_RECORDER_PASSWORD=${JIBRI_RECORDER_PASSWORD}/" .env
else
    # Linux
    sed -i "s/^JICOFO_AUTH_PASSWORD=.*/JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}/" .env
    sed -i "s/^JVB_AUTH_PASSWORD=.*/JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}/" .env
    sed -i "s/^JIGASI_XMPP_PASSWORD=.*/JIGASI_XMPP_PASSWORD=${JIGASI_XMPP_PASSWORD}/" .env
    sed -i "s/^JIGASI_XMPP_PASSWORD=.*/JIGASI_XMPP_PASSWORD=${JIGASI_XMPP_PASSWORD}/" .env
    sed -i "s/^JIBRI_RECORDER_PASSWORD=.*/JIBRI_RECORDER_PASSWORD=${JIBRI_RECORDER_PASSWORD}/" .env
fi

echo "✅ Senhas geradas com sucesso!"
echo ""
echo "📝 Senhas foram atualizadas no arquivo .env"
echo ""
echo "⚠️  IMPORTANTE: Mantenha o arquivo .env seguro e não compartilhe essas senhas!"

