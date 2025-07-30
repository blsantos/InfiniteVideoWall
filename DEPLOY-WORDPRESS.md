# 🚀 Deploy no WordPress - reparacoeshistoricas.org

## Guia Completo de Transferência

### 📋 Preparação

**Você precisará de:**
- Acesso ao cPanel do Hostinger
- Credenciais PostgreSQL (criar nova database)
- Chaves da API YouTube (Google Cloud Console)
- Acesso wp-admin do WordPress

### 🔧 Passo 1: Preparar Servidor Hostinger

**1.1. Criar Database PostgreSQL**
- cPanel → PostgreSQL Databases
- Create Database: `reparacoes_videos`
- Create User: `reparacoes_user`
- Assign User to Database (All Privileges)
- Anotar: host, database, user, password

**1.2. Ativar Node.js**
- cPanel → Node.js Selector
- Criar nova aplicação Node.js 18+
- Application Root: `public_html/app`
- Application URL: deixar vazio
- Startup File: `server/index.js`

### 📁 Passo 2: Upload da Aplicação

**2.1. Via File Manager cPanel:**
```
/public_html/
├── app/                    # Upload TODA esta pasta
│   ├── client/
│   ├── server/
│   ├── shared/
│   ├── package.json
│   └── ... (todos os arquivos)
└── ... (WordPress já existente)
```

**2.2. Configurar Variáveis de Ambiente**
- Criar `/public_html/app/.env`:
```env
DATABASE_URL=postgresql://reparacoes_user:SUA_SENHA@localhost:5432/reparacoes_videos
YOUTUBE_API_KEY=SUA_CHAVE_YOUTUBE
YOUTUBE_CLIENT_ID=SEU_CLIENT_ID  
YOUTUBE_CLIENT_SECRET=SEU_CLIENT_SECRET
SESSION_SECRET=uma_chave_secreta_muito_forte_aqui
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=reparacoeshistoricas.org
```

### ⚙️ Passo 3: Instalação no Servidor

**3.1. Via Terminal cPanel:**
```bash
cd /public_html/app
npm install --production
npm run build
npm run db:push
```

**3.2. Configurar Node.js App**
- Voltar ao Node.js Selector
- Click "Restart" na aplicação
- Verificar se Status = "Running"

### 🌐 Passo 4: Configurar Redirecionamentos

**4.1. Editar `/public_html/.htaccess`:**
```apache
# Muro Infinito de Vídeos - API Routes
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin/?$ http://localhost:3000/admin [P,L]
RewriteRule ^upload/?$ http://localhost:3000/upload [P,L]
RewriteRule ^statistics/?$ http://localhost:3000/statistics [P,L]
RewriteRule ^info/?$ http://localhost:3000/info [P,L]

# WordPress - mantém funcionamento normal
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

### 🔌 Passo 5: Instalar Plugin WordPress

**5.1. Via wp-admin:**
- Plugins → Adicionar Novo → Upload Plugin
- Upload: `wordpress-integration/muro-videos-plugin.zip` 
- Ativar Plugin

**5.2. Ou via FTP:**
- Upload `wordpress-integration/muro-videos/` para `/wp-content/plugins/`
- wp-admin → Plugins → Ativar "Muro Infinito de Vídeos"

### 📺 Passo 6: Configurar YouTube OAuth

**6.1. Google Cloud Console:**
- Ir para: https://console.cloud.google.com
- APIs & Services → Credentials
- Edit OAuth 2.0 Client
- Authorized redirect URIs: adicionar
  `https://reparacoeshistoricas.org/api/youtube/callback`

### ✅ Passo 7: Testar Funcionamento

**7.1. URLs para testar:**
- Site: https://reparacoeshistoricas.org ✓
- API: https://reparacoeshistoricas.org/api/videos ✓
- Admin: https://reparacoeshistoricas.org/admin ✓

**7.2. Testar Shortcode:**
- Criar nova página no WordPress
- Adicionar conteúdo:
```html
<h2>Muro de Vídeos</h2>
[muro_videos width="100%" height="600px"]
```
- Publicar e verificar

### 🔧 Passo 8: Usar em Páginas WordPress

**Shortcodes disponíveis:**
```php
[muro_videos]                    // Muro completo
[youtube_video_wall]             // Compatibilidade
[muro_videos_chapter id="1"]     // Capítulo específico
```

**Exemplo de página completa:**
```html
<h1>Testemunhos Contra o Racismo</h1>
<p>Assista aos relatos reais de pessoas que enfrentaram discriminação racial:</p>

[muro_videos width="100%" height="700px"]

<h3>Como Contribuir</h3>
<p>Você também pode compartilhar sua experiência. Use o botão de upload na interface acima.</p>
```

### 🐛 Solução de Problemas

**Se a API não responder:**
```bash
# Via Terminal cPanel
cd /public_html/app
pm2 restart server/index.js
# ou
node server/index.js
```

**Se vídeos não aparecerem:**
- Verificar se YouTube API Key está correta
- Verificar se Canal ID está correto no código
- Verificar logs: `/public_html/app/logs/`

**Se Plugin não funcionar:**
- Verificar se .htaccess está correto
- Verificar se Node.js app está running
- Testar URL da API diretamente

### 📊 Monitoramento

**Verificar saúde do sistema:**
- cPanel → Node.js → Status da aplicação
- Error Logs do cPanel
- Testar URLs periodicamente

### 🎯 URLs Finais Funcionando

Após instalação completa:
- **WordPress:** https://reparacoeshistoricas.org
- **Muro de Vídeos:** https://reparacoeshistoricas.org (com shortcode)
- **Admin Panel:** https://reparacoeshistoricas.org/admin
- **API Vídeos:** https://reparacoeshistoricas.org/api/videos
- **Upload:** https://reparacoeshistoricas.org/upload

### 📞 Suporte

Se precisar de ajuda:
1. Verificar logs no cPanel
2. Testar cada URL individualmente
3. Verificar configuração Node.js
4. Verificar configuração .htaccess

**Canal YouTube verificado:** @ReparacoesHistoricas (UCRMRvNncp4fFy-27JD4Ph2w)