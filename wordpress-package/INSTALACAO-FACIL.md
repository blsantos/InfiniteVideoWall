# 🚀 INSTALAÇÃO SUPER FÁCIL NO WORDPRESS

## Passo 1: Upload da Aplicação Principal

**No cPanel do Hostinger:**
1. File Manager → `public_html`
2. Criar pasta `app`
3. Upload de TODOS os arquivos da aplicação para `public_html/app/`
   - client/
   - server/
   - shared/
   - package.json
   - (todos os outros arquivos)

## Passo 2: Configurar Node.js

**No cPanel:**
1. Node.js Selector → Create Application
2. Node.js Version: 18+
3. Application Root: `public_html/app`
4. Application URL: deixar vazio
5. Startup File: `server/index.js`

## Passo 3: Variáveis de Ambiente

**Criar arquivo `.env` em `public_html/app/.env`:**
```
DATABASE_URL=postgresql://seu_user:sua_senha@localhost:5432/sua_database
YOUTUBE_API_KEY=sua_chave_youtube
YOUTUBE_CLIENT_ID=seu_client_id
YOUTUBE_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=uma_chave_secreta_muito_forte
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=reparacoeshistoricas.org
```

## Passo 4: Instalar Dependências

**Terminal do cPanel:**
```bash
cd public_html/app
npm install --production
npm run build
npm run db:push
```

## Passo 5: Plugin WordPress

**Upload do Plugin:**
1. wp-admin → Plugins → Add New → Upload Plugin
2. Upload: `muro-videos-plugin.zip` (desta pasta)
3. Activate Plugin

## Passo 6: Configurar .htaccess

**Editar `public_html/.htaccess` - ADICIONAR no topo:**
```apache
# Muro Videos API
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin$ http://localhost:3000/admin [P,L]
RewriteRule ^upload$ http://localhost:3000/upload [P,L]

# WordPress normal (manter existente)
```

## Passo 7: Usar nas Páginas

**Adicionar em qualquer página/post:**
```
[muro_videos width="100%" height="600px"]
```

## ✅ Pronto!

**URLs que funcionarão:**
- https://reparacoeshistoricas.org (WordPress normal)
- https://reparacoeshistoricas.org/admin (painel admin)
- Páginas com shortcode mostrarão o muro de vídeos

**Canal:** @ReparacoesHistoricas com 3 vídeos ativos