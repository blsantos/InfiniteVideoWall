# Changelog - Muro Infinito de Vídeos

## [2.1.0] - 2025-07-31 - Deploy VPS Ready

### 🚀 VPS Deployment
- DNS configurado: `muro.reparacoeshistoricas.org` → `46.202.175.252`
- Scripts de instalação VPS automatizados
- Configuração Nginx + SSL (Let's Encrypt) automática
- Sistema PM2 para gerenciamento de processos
- Template .env específico para produção VPS

### 📁 Arquivos Criados
- `vps-deploy/install-vps.sh` - Preparação completa do VPS
- `vps-deploy/setup-app.sh` - Configuração da aplicação
- `vps-deploy/deploy-46-202-175-252.sh` - Deploy específico
- `vps-deploy/.env.template` - Template de configuração
- `vps-deploy/comandos-uteis.md` - Comandos de gerenciamento
- `vps-deploy/VANTAGENS-VPS.md` - Comparativo com WordPress

### 🔄 WordPress Integration (Alternativa)
- Plugin WordPress completo criado
- Shortcodes: `[muro_videos]`, `[youtube_video_wall]`, `[muro_videos_chapter]`
- Documentação de integração detalhada
- Exemplos de uso em páginas WordPress

### 🎯 Arquitetura Final
- **Opção 1 (Recomendada):** VPS subdomínio `muro.reparacoeshistoricas.org`
- **Opção 2:** Integração WordPress via plugin e proxy
- Sistema busca dados diretos do canal @ReparacoesHistoricas
- 3 vídeos ativos sendo exibidos em tempo real

---

## [2.0.0] - 2025-07-30 - Dados Diretos YouTube

### ✨ Arquitetura Redesenhada
- Eliminou dependência de base de dados como intermediário
- Endpoints buscam dados diretamente do canal YouTube
- Performance superior com dados em tempo real
- Thumbnails autênticas e metadados reais

### 🔧 Correções Técnicas
- Fix: erro de data usando `publishedAt` ao invés de `createdAt`
- 3 vídeos ativos do canal @ReparacoesHistoricas sendo exibidos
- Moderação com dados reais do canal YouTube
- API pública funcionando: `✅ Encontrados 3 vídeos para exibição pública`

### 📺 Canal YouTube Verificado
- **Canal:** @ReparacoesHistoricas
- **Channel ID:** UCRMRvNncp4fFy-27JD4Ph2w
- **Status:** 3 vídeos ativos
- **API:** Dados em tempo real sem armazenamento local

---

## [1.5.0] - 2025-07-15 - Upload Direto Implementado

### 🎯 Sistema de Upload Simplificado
- Upload direto para usuários finais (sem OAuth complexo)
- Separação clara: Upload usuário → Moderação → YouTube (admin)
- Campo `filePath` adicionado ao schema do banco
- Interface de moderação com botão "Enviar ao YouTube"
- Remoção da complexidade OAuth para usuários regulares

### 🔄 Fluxo Redesenhado
1. Usuário: Upload direto de vídeo + dados demográficos
2. Sistema: Armazenamento local + status "pending"
3. Admin: Moderação + envio ao YouTube (apenas admins)
4. Resultado: Vídeo público no canal oficial

---

## [1.0.0] - 2025-07-12 - Layout e Navegabilidade Completos

### 🎨 Interface Finalizada
- Muro infinito de vídeos com grid responsivo
- Tema branco com cores laranja (#FF6B35) do logo
- Localização brasileira (cidades, tipos de racismo, demografia)
- Logo posicionado no canto superior esquerdo

### 🧭 Sistema de Navegação
- 4 botões direcionais (Norte, Sul, Leste, Oeste)
- 2 botões de ação flutuantes (Upload, Info)
- Thumbnails maiores para melhor visibilidade
- Interface mobile-first otimizada

### 📱 QR Codes
- Sistema preparado para capítulos de livros
- Geração automática de códigos
- Navegação por capítulos específicos

---

## [0.1.0] - 2025-07-05 - Setup Inicial

### 🏗️ Arquitetura Base
- React 18 + TypeScript + Vite
- Node.js + Express + PostgreSQL
- Drizzle ORM + TanStack Query
- Replit Auth + OpenID Connect
- YouTube Data API v3 integration

### 📋 Funcionalidades Core
- Sistema de autenticação
- Upload de vídeos básico
- Interface de moderação inicial
- Integração YouTube API
- Base de dados PostgreSQL