#!/bin/bash

# Script para criar pacote WordPress completo
echo "📦 Criando pacote WordPress para reparacoeshistoricas.org"
echo "==========================================================="

# Criar diretório de deploy
mkdir -p deploy/wordpress-package
cd deploy/wordpress-package

# 1. Copiar aplicação completa
echo "📁 Copiando aplicação Node.js..."
cp -r ../../client ./
cp -r ../../server ./
cp -r ../../shared ./
cp -r ../../migrations ./
cp ../../package.json ./
cp ../../package-lock.json ./
cp ../../tsconfig.json ./
cp ../../vite.config.ts ./
cp ../../tailwind.config.ts ./
cp ../../postcss.config.js ./
cp ../../components.json ./
cp ../../drizzle.config.ts ./

# 2. Copiar plugin WordPress
echo "📁 Copiando plugin WordPress..."
mkdir -p wp-plugin/muro-videos
cp ../../wordpress-integration/muro-videos-plugin.php wp-plugin/muro-videos/
cp ../../wordpress-integration/README-WORDPRESS.md wp-plugin/muro-videos/

# 3. Criar arquivos de configuração
echo "⚙️  Criando arquivos de configuração..."

# .env template
cat > .env.template << 'EOL'
DATABASE_URL=postgresql://usuario:senha@localhost:5432/database_name
YOUTUBE_API_KEY=sua_chave_youtube_aqui
YOUTUBE_CLIENT_ID=seu_client_id_aqui
YOUTUBE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET=generate_strong_secret_here
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=reparacoeshistoricas.org
EOL

# .htaccess para WordPress
cat > htaccess-wordpress << 'EOL'
# Muro Infinito de Vídeos - Integração WordPress
RewriteEngine On

# Redirecionar API e rotas da aplicação para Node.js
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

# Package.json para produção
cat > package-prod.json << 'EOL'
{
  "name": "muro-videos-reparacoes-historicas",
  "version": "2.0.0",
  "description": "Sistema de muro infinito de vídeos para testemunhos sobre racismo",
  "main": "server/index.js",
  "scripts": {
    "start": "NODE_ENV=production node server/index.js",
    "build": "vite build",
    "db:push": "drizzle-kit push",
    "install-prod": "npm install --production"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOL

# 4. Criar instruções de instalação
cat > INSTALACAO-WORDPRESS.md << 'EOL'
# Instalação no WordPress - reparacoeshistoricas.org

## Passo a Passo Completo

### 1. Upload via FTP/cPanel
```
/public_html/
├── app/                    # Esta pasta completa
├── wp-content/
│   └── plugins/
│       └── muro-videos/    # Plugin da pasta wp-plugin/
└── .htaccess              # Substituir pelo htaccess-wordpress
```

### 2. Configuração no Servidor
```bash
cd /public_html/app
cp .env.template .env
# Editar .env com suas credenciais
npm install --production
npm run build
npm run db:push
```

### 3. Configurar Node.js no cPanel
- Versão: Node.js 18+
- Pasta: public_html/app
- Startup file: server/index.js
- Restart após mudanças

### 4. Ativar Plugin WordPress
- wp-admin → Plugins → Ativar "Muro Infinito de Vídeos"

### 5. Usar em Páginas
```
[muro_videos width="100%" height="600px"]
[youtube_video_wall]
```

### URLs Finais
- Site: https://reparacoeshistoricas.org
- API: https://reparacoeshistoricas.org/api/videos
- Admin: https://reparacoeshistoricas.org/admin
EOL

# 5. Criar zip do plugin WordPress
echo "📦 Criando zip do plugin..."
cd wp-plugin
zip -r ../muro-videos-plugin.zip muro-videos/
cd ..

# 6. Criar arquivo completo
echo "📦 Criando pacote completo..."
cd ..
zip -r wordpress-package-complete.zip wordpress-package/

echo "✅ Pacote WordPress criado!"
echo ""
echo "📁 Arquivos gerados:"
echo "   - deploy/wordpress-package/ (pasta completa)"
echo "   - deploy/wordpress-package-complete.zip (arquivo único)"
echo "   - deploy/wordpress-package/muro-videos-plugin.zip (plugin)"
echo ""
echo "🚀 Pronto para upload no reparacoeshistoricas.org!"