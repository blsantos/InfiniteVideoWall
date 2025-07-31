# 🚀 Deploy VPS - muro.reparacoeshistoricas.org

## Muito mais simples que WordPress! 

### Vantagens do Subdomínio VPS:
- ✅ Instalação direta sem complicações WordPress
- ✅ Performance superior (Node.js nativo)
- ✅ Controle total sobre configuração
- ✅ URLs limpas e profissionais
- ✅ Sem conflitos com WordPress principal

---

## 📋 Configuração VPS Completa

### 1. Preparar Subdomínio
**No painel DNS (Cloudflare/cPanel):**
```
Type: A
Name: muro
Value: [IP_DO_SEU_VPS]
TTL: Auto
```

### 2. Upload no VPS
```bash
# Conectar via SSH
ssh root@seu-vps-ip

# Criar diretório
mkdir -p /var/www/muro.reparacoeshistoricas.org
cd /var/www/muro.reparacoeshistoricas.org

# Upload dos arquivos (toda a aplicação)
# Via SCP, SFTP ou git clone
```

### 3. Configurar Environment
```bash
# Criar .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@localhost:5432/muro_videos
YOUTUBE_API_KEY=sua_chave_youtube
YOUTUBE_CLIENT_ID=seu_client_id
YOUTUBE_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=chave_secreta_forte_aleatoria
NODE_ENV=production
PORT=3000
REPLIT_DOMAINS=muro.reparacoeshistoricas.org
EOF
```

### 4. Instalar e Rodar
```bash
# Instalar dependências
npm install --production

# Build da aplicação
npm run build

# Configurar banco
npm run db:push

# Instalar PM2 para produção
npm install -g pm2

# Iniciar aplicação
pm2 start server/index.js --name "muro-videos"
pm2 save
pm2 startup
```

### 5. Configurar Nginx
```nginx
# /etc/nginx/sites-available/muro.reparacoeshistoricas.org
server {
    listen 80;
    server_name muro.reparacoeshistoricas.org;
    
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

```bash
# Ativar site
ln -s /etc/nginx/sites-available/muro.reparacoeshistoricas.org /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. SSL com Certbot
```bash
# Instalar certbot
apt install certbot python3-certbot-nginx

# Gerar certificado
certbot --nginx -d muro.reparacoeshistoricas.org
```

---

## 🎯 URLs Finais

- **Site Principal:** https://muro.reparacoeshistoricas.org
- **API:** https://muro.reparacoeshistoricas.org/api/videos
- **Admin:** https://muro.reparacoeshistoricas.org/admin
- **Upload:** https://muro.reparacoeshistoricas.org/upload
- **Capítulos:** https://muro.reparacoeshistoricas.org/chapter/1

---

## 📺 Canal YouTube

**@ReparacoesHistoricas** com 3 vídeos sendo exibidos diretamente!
- Dados em tempo real do canal
- Sem complicações WordPress
- Performance máxima

---

## 🔗 Integração com Site Principal

### No WordPress (reparacoeshistoricas.org):
```html
<!-- Página dedicada ao muro -->
<h2>Muro Infinito de Vídeos</h2>
<p>Assista aos testemunhos reais sobre racismo:</p>
<a href="https://muro.reparacoeshistoricas.org" 
   target="_blank" 
   class="btn btn-primary">
   Acessar Muro de Vídeos
</a>

<!-- Ou incorporar via iframe -->
<iframe 
    src="https://muro.reparacoeshistoricas.org" 
    width="100%" 
    height="700px" 
    frameborder="0">
</iframe>
```

---

## ⚡ Muito Mais Simples!

**Comparação:**
- ❌ WordPress: Plugin + proxy + configurações complexas
- ✅ VPS: Upload direto + nginx + SSL = pronto!

**Performance:**
- ❌ WordPress: Overhead do WordPress + proxy
- ✅ VPS: Node.js direto = velocidade máxima

**Manutenção:**
- ❌ WordPress: Dependente do WordPress + conflitos
- ✅ VPS: Aplicação independente + updates simples