# Muro Infinito de Vídeos - Reparações Históricas

Sistema completo de muro infinito de vídeos para testemunhos sobre racismo, integrado com canal YouTube @ReparacoesHistoricas e WordPress.

## 🎯 Características Principais

- **Dados Diretos do YouTube**: Sistema busca vídeos diretamente do canal @ReparacoesHistoricas
- **Interface Responsiva**: Design mobile-first com navegação intuitiva
- **Admin Dashboard**: Panel completo para moderação e gestão de conteúdo
- **QR Codes**: Geração automática para capítulos de livros
- **Integração WordPress**: Plugin completo com shortcodes
- **Upload Direto**: Sistema simplificado para contribuições dos usuários

## 🏗️ Arquitetura

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + Radix UI
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento
- **Vite** para build e desenvolvimento

### Backend
- **Node.js** + Express.js
- **PostgreSQL** com Drizzle ORM
- **YouTube Data API v3**
- **Replit Auth** com OpenID Connect
- **Multer** para upload de arquivos

### Integração
- **Plugin WordPress** completo
- **Shortcodes** para fácil implementação
- **API RESTful** documentada
- **Sistema de proxy** para integração perfeita

## 🚀 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/usuario/muro-videos-reparacoes-historicas.git
cd muro-videos-reparacoes-historicas

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Configurar banco de dados
npm run db:push

# Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/database
YOUTUBE_API_KEY=sua_chave_youtube
YOUTUBE_CLIENT_ID=seu_client_id
YOUTUBE_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=chave_secreta_forte
NODE_ENV=development
```

## 📺 Canal YouTube

**Canal:** @ReparacoesHistoricas  
**Channel ID:** UCRMRvNncp4fFy-27JD4Ph2w  
**URL:** https://www.youtube.com/channel/UCRMRvNncp4fFy-27JD4Ph2w

O sistema busca vídeos diretamente deste canal, sem armazenamento local intermediário.

## 🔧 Funcionalidades

### Para Usuários
- **Muro Infinito**: Visualização contínua de vídeos em grid responsivo
- **Upload Direto**: Envio simplificado de testemunhos
- **Navegação por Capítulos**: Acesso via QR codes
- **Player Integrado**: Reprodução inline com controles completos

### Para Administradores  
- **Moderação**: Aprovação/rejeição de vídeos pendentes
- **Analytics**: Estatísticas demográficas detalhadas
- **QR Codes**: Geração e gestão de códigos para capítulos
- **YouTube Integration**: Envio direto para o canal oficial

## 📱 WordPress Integration

### Instalação do Plugin

1. **Upload via wp-admin:**
   - Plugins → Adicionar Novo → Upload
   - Fazer upload do `muro-videos-plugin.zip`
   - Ativar plugin

2. **Upload via FTP:**
   - Copiar pasta `muro-videos/` para `/wp-content/plugins/`
   - Ativar no painel administrativo

### Shortcodes Disponíveis

```php
// Muro completo de vídeos
[muro_videos width="100%" height="600px"]

// Capítulo específico
[muro_videos_chapter id="1" title="Racismo no Trabalho"]

// Compatibilidade original
[youtube_video_wall]
```

### Exemplo de Uso

```html
<h2>Testemunhos Reais sobre Racismo</h2>
<p>Veja relatos autênticos de pessoas que sofreram discriminação racial:</p>

[muro_videos width="100%" height="700px"]

<p>Você também pode contribuir com seu testemunho através do botão de upload.</p>
```

## 🌐 Deploy em Produção

### Opção 1: VPS Subdomínio (Recomendado)
**URL:** muro.reparacoeshistoricas.org (46.202.175.252)

#### Vantagens VPS:
- Performance superior (Node.js direto)
- URL profissional e memorável
- Controle total sobre configuração
- SSL automático com Let's Encrypt
- Manutenção independente do WordPress

#### Processo VPS:
```bash
# 1. Conectar ao VPS
ssh root@46.202.175.252

# 2. Executar script de instalação
bash vps-deploy/install-vps.sh

# 3. Upload da aplicação
scp -r . root@46.202.175.252:/var/www/muro.reparacoeshistoricas.org/

# 4. Configurar e iniciar
cd /var/www/muro.reparacoeshistoricas.org
bash vps-deploy/setup-app.sh
```

### Opção 2: WordPress Integration (Hostinger)

### 1. Preparação do Servidor Hostinger

```bash
# Via SSH ou Terminal cPanel
cd /public_html
mkdir app
cd app

# Upload dos arquivos da aplicação
# (usar FTP ou File Manager do cPanel)
```

### 2. Configuração Node.js

**No cPanel Node.js Selector:**
- Versão: Node.js 18+
- Pasta da aplicação: `public_html/app`
- Startup file: `server/index.js`
- Variáveis de ambiente: configurar no painel

### 3. Configuração do Banco PostgreSQL

**Criar database no cPanel:**
- PostgreSQL Databases → Create Database
- Anotar credenciais para o .env

### 4. Instalação e Build

```bash
cd /public_html/app
npm install --production
npm run build
npm run db:push
```

### 5. Configuração do .htaccess

```apache
# Redirecionar API para Node.js
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^chapter/(.*)$ http://localhost:3000/chapter/$1 [P,L]
RewriteRule ^admin$ http://localhost:3000/admin [P,L]
RewriteRule ^upload$ http://localhost:3000/upload [P,L]

# WordPress normal
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

### 6. URLs Finais

**VPS (Recomendado):**
- **Site:** https://muro.reparacoeshistoricas.org
- **API:** https://muro.reparacoeshistoricas.org/api/videos
- **Admin:** https://muro.reparacoeshistoricas.org/admin
- **Upload:** https://muro.reparacoeshistoricas.org/upload

**WordPress Integration:**
- **Site:** https://reparacoeshistoricas.org
- **API:** https://reparacoeshistoricas.org/api/videos
- **Admin:** https://reparacoeshistoricas.org/admin
- **Upload:** https://reparacoeshistoricas.org/upload

## 📊 Arquitetura de Dados

### Fluxo de Dados Atual (v2.0)
```
Canal YouTube @ReparacoesHistoricas
         ↓
    YouTube Data API
         ↓
   Sistema Backend (Node.js)
         ↓
   Frontend React / WordPress
```

**Importante:** O sistema não usa mais base de dados local como intermediário. Todos os vídeos são buscados diretamente do canal YouTube em tempo real.

### Endpoints Principais

```
GET  /api/videos              # Vídeos públicos do canal
GET  /api/admin/videos        # Vídeos para moderação
GET  /api/chapters            # Capítulos disponíveis
POST /api/videos              # Upload de novo vídeo
GET  /api/admin/stats         # Estatísticas gerais
```

## 🔐 Configuração YouTube OAuth

### Google Cloud Console
1. Criar projeto ou usar existente
2. Habilitar YouTube Data API v3
3. Criar credenciais OAuth 2.0
4. Adicionar URLs de callback:
   - Desenvolvimento: `http://localhost:5000/api/youtube/callback`
   - Produção: `https://reparacoeshistoricas.org/api/youtube/callback`

### Scopes Necessários
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.readonly`

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
├── server/                # Backend Node.js
│   ├── index.ts          # Entrada principal
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   ├── youtube.ts        # Integração YouTube
│   └── replitAuth.ts     # Autenticação
├── shared/               # Tipos compartilhados
│   └── schema.ts         # Schema Drizzle
├── wordpress-integration/ # Plugin WordPress
└── deployment/          # Scripts de deploy
```

## 🎨 Design e UX

- **Tema:** Cores laranja (#FF6B35) baseadas no logo
- **Tipografia:** Sistema de fontes moderno
- **Layout:** Grid responsivo com cards de vídeo
- **Navegação:** 4 botões direcionais + 2 ações flutuantes
- **Mobile:** Interface otimizada para toque

## 📈 Estatísticas e Analytics

O sistema coleta dados demográficos opcionais dos usuários:
- Localização (cidade/estado)
- Faixa etária
- Escolaridade
- Renda familiar
- Tipo de racismo sofrido

**Privacidade:** Todos os dados são anônimos e usados apenas para estatísticas gerais.

## 🔄 Histórico de Versões

### v2.0.0 (Julho 2025)
- Dados diretos do YouTube (sem base intermediária)
- Plugin WordPress completo
- Interface de moderação redesenhada
- QR Codes para capítulos
- Sistema de upload simplificado

### v1.0.0 (Julho 2025)
- Implementação inicial
- Integração básica com YouTube
- Interface de muro infinito
- Sistema de autenticação

## 🤝 Contribuição

Este projeto é mantido pela equipe de Reparações Históricas para amplificar vozes que sofreram racismo.

### Como Contribuir
1. Fork do repositório
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -am 'Adicionar nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Criar Pull Request

## 📞 Suporte

- **Site:** https://reparacoeshistoricas.org
- **Canal:** @ReparacoesHistoricas
- **Issues:** GitHub Issues deste repositório

## 📄 Licença

Este projeto está licenciado sob MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Muro Infinito de Vídeos** - Amplificando vozes, construindo reparação histórica. 🎬✊