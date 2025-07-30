# 📋 PASSO A PASSO SIMPLES - INSTALAÇÃO WORDPRESS

## ⚡ RESUMO SUPER RÁPIDO

1. **Upload aplicação** → `public_html/app/` (todos os arquivos)
2. **Configurar Node.js** → cPanel Node.js Selector
3. **Criar .env** → com credenciais PostgreSQL + YouTube
4. **Install plugin** → Upload `muro-videos-plugin.tar.gz`
5. **Usar shortcode** → `[muro_videos]` nas páginas

---

## 🗃️ ARQUIVOS NESTE PACOTE

```
wordpress-package/
├── muro-videos/              # Plugin WordPress
│   └── index.php            # Arquivo principal do plugin
├── muro-videos-plugin.tar.gz # Plugin compactado para upload
├── INSTALACAO-FACIL.md       # Instruções detalhadas
├── exemplo-pagina.html       # Exemplo de uso nas páginas
├── credenciais-necessarias.txt # Lista de credenciais necessárias
└── PASSO-A-PASSO-SIMPLES.md  # Este arquivo
```

---

## 🚀 PROCESSO COMPLETO

### 1. Preparar Aplicação Principal
- Fazer download/clone do repositório GitHub completo
- Upload de TODA a aplicação para `public_html/app/`

### 2. Configurar Servidor (Hostinger)
- **PostgreSQL:** Criar database no cPanel
- **Node.js:** Configurar aplicação (pasta `app`, startup `server/index.js`)
- **Environment:** Criar `.env` com credenciais (ver exemplo em `credenciais-necessarias.txt`)

### 3. Instalar Plugin WordPress
- **Via wp-admin:** Upload `muro-videos-plugin.tar.gz` (extrair manualmente se necessário)
- **Ou manual:** Upload pasta `muro-videos/` para `/wp-content/plugins/`
- **Ativar:** Plugin "Muro Infinito de Vídeos" no wp-admin

### 4. Configurar Redirecionamentos
```apache
# Adicionar no TOPO do .htaccess
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin$ http://localhost:3000/admin [P,L]
RewriteRule ^upload$ http://localhost:3000/upload [P,L]
```

### 5. Testar e Usar
- **Teste:** https://reparacoeshistoricas.org/api/videos
- **Admin:** https://reparacoeshistoricas.org/admin
- **Usar:** Shortcode `[muro_videos]` nas páginas

---

## 📺 RESULTADO FINAL

**Páginas WordPress funcionando normalmente + Muro de Vídeos integrado**

### Shortcodes Disponíveis:
```
[muro_videos]                    # Muro completo
[youtube_video_wall]             # Compatibilidade
[muro_videos_chapter id="1"]     # Capítulo específico
```

### URLs que funcionarão:
- https://reparacoeshistoricas.org → WordPress normal
- https://reparacoeshistoricas.org/admin → Painel admin
- Páginas com shortcode → Muro de vídeos incorporado

---

## ⚠️ CREDENCIAIS NECESSÁRIAS

**Para funcionamento completo você precisa:**
1. **PostgreSQL** (cPanel Hostinger)
2. **YouTube API Keys** (Google Cloud Console)
3. **Session Secret** (chave aleatória forte)

Ver detalhes completos em `credenciais-necessarias.txt`

---

## 🎯 CANAL YOUTUBE

**@ReparacoesHistoricas** (UCRMRvNncp4fFy-27JD4Ph2w)  
✅ 3 vídeos ativos sendo exibidos diretamente

Sistema busca dados em tempo real do canal, sem armazenamento local!