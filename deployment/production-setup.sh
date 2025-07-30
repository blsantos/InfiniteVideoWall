#!/bin/bash

# Script de setup para produção - reparacoeshistoricas.org
# Execute este script na pasta raiz da aplicação no servidor

echo "🚀 Configurando Muro Infinito de Vídeos para Produção"
echo "======================================================"

# 1. Verificar Node.js
echo "📋 Verificando Node.js..."
node --version || { echo "❌ Node.js não encontrado! Instale Node.js 18+"; exit 1; }
npm --version || { echo "❌ NPM não encontrado!"; exit 1; }

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# 3. Verificar variáveis de ambiente
echo "🔧 Verificando configuração..."
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado! Criando template..."
    cat > .env << EOL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/database_name
YOUTUBE_API_KEY=sua_chave_youtube_aqui
YOUTUBE_CLIENT_ID=seu_client_id_aqui
YOUTUBE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=reparacoeshistoricas.org
EOL
    echo "⚠️  Configure o arquivo .env com suas credenciais!"
    echo "⚠️  Dados necessários:"
    echo "   - Credenciais PostgreSQL do Hostinger"
    echo "   - Chaves da API YouTube"
    read -p "Pressione Enter após configurar o .env..."
fi

# 4. Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build || { echo "❌ Build falhou!"; exit 1; }

# 5. Configurar banco de dados
echo "🗄️  Configurando banco de dados..."
npm run db:push || { echo "❌ Configuração do banco falhou!"; exit 1; }

# 6. Testar aplicação
echo "🧪 Testando aplicação..."
timeout 10s npm start &
sleep 5
curl -f http://localhost:3000/api/videos > /dev/null || { echo "❌ Aplicação não responde!"; exit 1; }
pkill -f "node.*server"

# 7. Configurar PM2 (se disponível)
if command -v pm2 &> /dev/null; then
    echo "⚙️  Configurando PM2..."
    pm2 delete muro-videos 2>/dev/null || true
    pm2 start server/index.js --name "muro-videos" --env production
    pm2 save
    pm2 startup
else
    echo "⚠️  PM2 não encontrado. Configure manualmente o processo Node.js"
fi

# 8. Configurar .htaccess
echo "🌐 Configurando redirecionamentos..."
if [ ! -f "../.htaccess.backup" ]; then
    cp ../.htaccess ../.htaccess.backup 2>/dev/null || true
fi

cat > ../.htaccess << 'EOL'
# Muro Infinito de Vídeos - Redirecionamentos
RewriteEngine On

# API e rotas da aplicação para Node.js
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin/?$ http://localhost:3000/admin [P,L]
RewriteRule ^upload/?$ http://localhost:3000/upload [P,L]
RewriteRule ^statistics/?$ http://localhost:3000/statistics [P,L]
RewriteRule ^info/?$ http://localhost:3000/info [P,L]

# WordPress - rotas padrão
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
EOL

echo "✅ Setup de produção concluído!"
echo ""
echo "🔗 URLs disponíveis:"
echo "   - Site: https://reparacoeshistoricas.org"
echo "   - API: https://reparacoeshistoricas.org/api/videos"
echo "   - Admin: https://reparacoeshistoricas.org/admin"
echo "   - Upload: https://reparacoeshistoricas.org/upload"
echo ""
echo "📝 Próximos passos:"
echo "   1. Instalar plugin WordPress na pasta wp-content/plugins/"
echo "   2. Ativar plugin no wp-admin"
echo "   3. Usar shortcode [muro_videos] nas páginas"
echo "   4. Configurar YouTube OAuth com URL de produção"
echo ""
echo "🎯 Canal YouTube: @ReparacoesHistoricas"
echo "🎯 Vídeos sendo buscados diretamente do canal!"