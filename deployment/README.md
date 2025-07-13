# Instalação no Hostinger - Muro Infinito de Vídeos

## Requisitos do Servidor

### Hosting Hostinger
- **Plano recomendado**: VPS ou Cloud Hosting (Node.js não funciona em hosting compartilhado)
- **Node.js**: Versão 18 ou superior
- **PostgreSQL**: Banco de dados (pode usar Hostinger PostgreSQL ou externo como Neon)
- **SSL**: Certificado SSL ativo

### Verificar Suporte Node.js
1. Acesse o painel Hostinger
2. Verifique se tem "Node.js" nas opções
3. Se não tiver, considere:
   - Upgrade para VPS
   - Usar hosting externo como Vercel/Railway
   - Implementar apenas frontend e usar API externa

## Instalação Passo a Passo

### 1. Preparar Arquivos
```bash
# No seu computador, baixe todos os arquivos do projeto
# Certifique-se de ter a pasta completa com:
- client/ (frontend)
- server/ (backend) 
- shared/ (schemas)
- package.json
- vite.config.ts
- etc.
```

### 2. Configurar Banco de Dados

#### Opção A: PostgreSQL Hostinger
```sql
-- Criar banco no painel Hostinger
-- Anotar: host, porta, usuário, senha, nome do banco
```

#### Opção B: Neon Database (Recomendado)
```bash
# Criar conta gratuita em neon.tech
# Criar novo projeto
# Copiar connection string
```

### 3. Upload dos Arquivos
```bash
# Via FileZilla, cPanel ou terminal SSH
# Upload para pasta public_html/videos/ ou similar
```

### 4. Instalar Dependências
```bash
# SSH no servidor
cd /path/to/your/app
npm install
```

### 5. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env
nano .env
```

Conteúdo do .env:
```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/database"

# Sessão
SESSION_SECRET="sua-chave-secreta-super-forte-aqui"

# Replit Auth (opcional se quiser manter)
REPL_ID="seu-repl-id"
ISSUER_URL="https://replit.com/oidc"
REPLIT_DOMAINS="seu-dominio.com"

# Produção
NODE_ENV="production"
PORT="3000"
```

### 6. Build da Aplicação
```bash
npm run build
```

### 7. Configurar Banco
```bash
npm run db:push
```

### 8. Iniciar Aplicação
```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Com PM2 (recomendado)
pm2 start dist/server.js --name "video-wall"
pm2 startup
pm2 save
```

## Configuração do Servidor Web

### Nginx (Recomendado)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Integração com WordPress

### 1. Subdomain (Recomendado)
```
# Criar subdomínio: videos.reparacoeshistoricas.org
# Apontar para a aplicação Node.js
```

### 2. Iframe no WordPress
```html
<iframe 
  src="https://videos.reparacoeshistoricas.org/" 
  style="width: 100%; height: 70vh; border: none;"
  title="Muro Infinito de Vídeos">
</iframe>
```

### 3. Plugin WordPress
```php
// Instalar plugin criado anteriormente
// Usar shortcode: [video_wall]
```

## Alternativas se Node.js não for suportado

### 1. Frontend Estático + API Externa
```javascript
// Fazer build apenas do frontend
npm run build:client

// Hospedar arquivos estáticos no Hostinger
// API continua no Replit/Vercel/Railway
```

### 2. PHP Backend (Conversão)
```php
// Converter rotas Express para PHP
// Usar PDO para PostgreSQL
// Manter mesmo banco de dados
```

### 3. Hosting Externo
- **Vercel**: Deploy gratuito, ideal para Next.js
- **Railway**: Suporte completo Node.js + PostgreSQL
- **DigitalOcean**: VPS com controle total
- **Heroku**: Platform-as-a-Service

## Troubleshooting

### Problemas Comuns
1. **Node.js não suportado**: Upgrade plano ou use alternativa
2. **Erro de conexão DB**: Verificar credenciais e firewall
3. **SSL issues**: Configurar certificado corretamente
4. **Port binding**: Verificar se porta está disponível

### Logs
```bash
# Ver logs da aplicação
pm2 logs video-wall

# Logs do Nginx
tail -f /var/log/nginx/error.log
```

### Performance
```bash
# Otimizar para produção
export NODE_ENV=production

# Configurar PM2 cluster
pm2 start ecosystem.config.js
```

## Monitoramento

### Uptime
- Configurar monitoramento de uptime
- Alertas por email/SMS

### Backup
```bash
# Backup automático do banco
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Analytics
- Google Analytics
- Logs de acesso
- Métricas de performance