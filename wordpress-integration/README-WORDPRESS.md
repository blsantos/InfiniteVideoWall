# Integração WordPress - Muro Infinito de Vídeos

## Como transferir a aplicação para reparacoeshistoricas.org

### 1. Preparação do Servidor

**Requisitos no Hostinger:**
- Node.js 18+ (já disponível)
- PostgreSQL database (criar nova)
- SSL habilitado (já ativo)
- Domínio: reparacoeshistoricas.org

### 2. Upload da Aplicação

**Via FTP/cPanel File Manager:**
```bash
# Estrutura no servidor:
/public_html/
├── app/                    # Aplicação Node.js completa
│   ├── client/
│   ├── server/
│   ├── shared/
│   ├── package.json
│   └── ...todos os arquivos
├── wp-content/
│   └── plugins/
│       └── muro-videos/    # Plugin WordPress
└── ... (arquivos WordPress existentes)
```

### 3. Configuração do Banco PostgreSQL

**No cPanel/Hostinger:**
1. Criar nova database PostgreSQL
2. Anotar credenciais:
   - HOST: localhost
   - DATABASE: nome_da_database
   - USER: usuario_criado
   - PASSWORD: senha_definida

**Variáveis de ambiente (.env):**
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_database
YOUTUBE_API_KEY=sua_chave_youtube
YOUTUBE_CLIENT_ID=seu_client_id
YOUTUBE_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=chave_secreta_forte
NODE_ENV=production
```

### 4. Instalação no Servidor

**Via SSH ou Terminal do cPanel:**
```bash
cd /public_html/app
npm install --production
npm run build
npm run db:push
```

### 5. Configuração do Node.js

**No Hostinger cPanel:**
1. Ir em "Node.js Selector"
2. Criar nova aplicação:
   - Versão: Node.js 18+
   - Pasta: public_html/app
   - Startup file: server/index.js
   - Restart: Sempre após mudanças

### 6. Instalação do Plugin WordPress

**Upload do plugin:**
1. Ir em wp-admin → Plugins → Adicionar Novo → Upload
2. Fazer upload do arquivo `muro-videos-plugin.zip`
3. Ativar o plugin

**OU via FTP:**
1. Upload da pasta `muro-videos/` para `/wp-content/plugins/`
2. Ativar no wp-admin

### 7. Configuração do Proxy/Redirecionamento

**No .htaccess (pasta raiz):**
```apache
# Redirecionar API para aplicação Node.js
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin$ http://localhost:3000/admin [P,L]
RewriteRule ^upload$ http://localhost:3000/upload [P,L]

# WordPress normal para outras rotas
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

### 8. Uso nos Posts/Páginas WordPress

**Shortcodes disponíveis:**

```php
// Muro completo de vídeos
[muro_videos width="100%" height="600px"]

// Capítulo específico
[muro_videos_chapter id="1" title="Racismo no Trabalho"]

// Compatibilidade com requisito original
[youtube_video_wall]
```

**Exemplo de uso em página:**
```html
<h2>Testemunhos sobre Racismo</h2>
<p>Veja os relatos reais de pessoas que sofreram racismo:</p>

[muro_videos width="100%" height="700px"]

<p>Contribute com seu testemunho através do botão de upload na interface.</p>
```

### 9. URLs Finais de Produção

- **Site WordPress:** https://reparacoeshistoricas.org
- **Muro de vídeos:** https://reparacoeshistoricas.org (com shortcode)
- **API:** https://reparacoeshistoricas.org/api/*
- **Admin:** https://reparacoeshistoricas.org/admin
- **Upload:** https://reparacoeshistoricas.org/upload
- **Capítulos:** https://reparacoeshistoricas.org/chapter/1

### 10. Configuração YouTube OAuth (Produção)

**No Google Cloud Console:**
- Adicionar URL de callback: `https://reparacoeshistoricas.org/api/youtube/callback`
- Domínios autorizados: `reparacoeshistoricas.org`

### 11. Teste Final

**Verificar funcionamento:**
1. ✅ Site WordPress carregando normalmente
2. ✅ Shortcode [muro_videos] exibindo vídeos
3. ✅ API retornando dados do canal YouTube
4. ✅ Upload de vídeos funcionando
5. ✅ Admin panel acessível
6. ✅ QR codes gerando corretamente

### 12. Monitoramento

**Logs importantes:**
- `/public_html/app/logs/` - Logs da aplicação Node.js
- cPanel Error Logs - Erros do servidor
- WordPress Debug - Erros do plugin

### Suporte Técnico

Para dúvidas ou problemas na instalação, consulte:
- Documentação completa no arquivo `replit.md`
- Logs de erro no servidor
- Canal YouTube: @ReparacoesHistoricas (verificar se vídeos estão aparecendo)