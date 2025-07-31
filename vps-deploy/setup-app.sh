#!/bin/bash

# Setup da aplicação após upload dos arquivos
echo "⚙️  Configurando aplicação Muro de Vídeos"
echo "=========================================="

DOMAIN="muro.reparacoeshistoricas.org"
APP_DIR="/var/www/$DOMAIN"
NODE_USER="nodeapp"

# Verificar se diretório existe
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Diretório $APP_DIR não encontrado!"
    echo "Execute primeiro: bash install-vps.sh"
    exit 1
fi

cd $APP_DIR

# 1. Verificar arquivos da aplicação
echo "📋 Verificando arquivos..."
if [ ! -f "package.json" ]; then
    echo "❌ Arquivos da aplicação não encontrados em $APP_DIR"
    echo "Faça upload de todos os arquivos primeiro!"
    exit 1
fi

# 2. Instalar dependências
echo "📦 Instalando dependências da aplicação..."
sudo -u $NODE_USER npm install --production

# 3. Build da aplicação
echo "🔨 Fazendo build..."
sudo -u $NODE_USER npm run build

# 4. Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  Criando template .env..."
    cat > .env << 'EOF'
DATABASE_URL=postgresql://nodeapp:SUA_SENHA@localhost:5432/muro_videos
YOUTUBE_API_KEY=sua_chave_youtube_aqui
YOUTUBE_CLIENT_ID=seu_client_id_aqui
YOUTUBE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET=gere_uma_chave_forte_aqui
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=muro.reparacoeshistoricas.org
EOF
    chown $NODE_USER:$NODE_USER .env
    echo "❌ Configure o arquivo .env com suas credenciais!"
    echo "Edite: nano $APP_DIR/.env"
    read -p "Pressione Enter após configurar o .env..."
fi

# 5. Configurar banco de dados
echo "🗄️  Configurando banco de dados..."
sudo -u $NODE_USER npm run db:push

# 6. Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
sudo -u $NODE_USER pm2 delete muro-videos 2>/dev/null || true
sudo -u $NODE_USER pm2 start server/index.js --name "muro-videos"
sudo -u $NODE_USER pm2 save

# Configurar PM2 para iniciar com o sistema
env PATH=$PATH:/usr/bin pm2 startup systemd -u $NODE_USER --hp /home/$NODE_USER

# 8. Instalar SSL (Certbot)
echo "🔐 Configurando SSL..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@reparacoeshistoricas.org

echo "✅ Aplicação configurada com sucesso!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   - Site: https://$DOMAIN"
echo "   - API: https://$DOMAIN/api/videos"
echo "   - Admin: https://$DOMAIN/admin"
echo "   - Upload: https://$DOMAIN/upload"
echo ""
echo "📊 Status da aplicação:"
sudo -u $NODE_USER pm2 status
echo ""
echo "📋 Comandos úteis:"
echo "   - Ver logs: sudo -u $NODE_USER pm2 logs muro-videos"
echo "   - Restart: sudo -u $NODE_USER pm2 restart muro-videos"
echo "   - Status: sudo -u $NODE_USER pm2 status"