#!/bin/bash

# Script de instalação automática VPS - muro.reparacoeshistoricas.org
echo "🚀 Instalando Muro Infinito de Vídeos no VPS"
echo "=============================================="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Execute como root: sudo bash install-vps.sh"
    exit 1
fi

# Definir variáveis
DOMAIN="muro.reparacoeshistoricas.org"
APP_DIR="/var/www/$DOMAIN"
NODE_USER="nodeapp"

echo "📋 Configurando para: $DOMAIN"

# 1. Atualizar sistema
echo "🔄 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências
echo "📦 Instalando dependências..."
apt install -y nginx postgresql postgresql-contrib nodejs npm git curl

# 3. Configurar PostgreSQL
echo "🗄️  Configurando PostgreSQL..."
sudo -u postgres createuser --interactive --pwprompt $NODE_USER || true
sudo -u postgres createdb muro_videos -O $NODE_USER || true

# 4. Instalar Node.js 18+
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 5. Instalar PM2
echo "⚙️  Instalando PM2..."
npm install -g pm2

# 6. Criar usuário para aplicação
echo "👤 Criando usuário da aplicação..."
useradd -m -s /bin/bash $NODE_USER || true

# 7. Criar diretório da aplicação
echo "📁 Criando diretórios..."
mkdir -p $APP_DIR
chown $NODE_USER:$NODE_USER $APP_DIR

echo "✅ VPS preparado!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Upload dos arquivos da aplicação para: $APP_DIR"
echo "   2. Configurar .env com credenciais"
echo "   3. Executar: bash setup-app.sh"
echo "   4. Configurar DNS: muro A record → IP deste VPS"
echo ""
echo "🔗 Após DNS propagado: https://$DOMAIN"