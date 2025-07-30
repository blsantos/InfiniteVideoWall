#!/bin/bash

# Script para commit inicial no GitHub
echo "🚀 Preparando commit para GitHub - Muro Infinito de Vídeos"
echo "=========================================================="

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositório Git..."
    git init
fi

# Adicionar todos os arquivos
echo "📋 Adicionando arquivos..."
git add .

# Fazer commit inicial
echo "💾 Fazendo commit inicial..."
git commit -m "🎬 Sistema Muro Infinito de Vídeos v2.0

✨ Características principais:
- Dados diretos do canal YouTube @ReparacoesHistoricas
- Interface responsiva React + TypeScript 
- Admin dashboard completo com moderação
- Plugin WordPress com shortcodes
- QR codes para capítulos de livros
- Sistema de upload simplificado

🏗️ Arquitetura:
- Frontend: React 18 + Tailwind CSS + Radix UI
- Backend: Node.js + Express + PostgreSQL
- API: YouTube Data API v3 integração completa
- Auth: Replit Auth com OpenID Connect

🌐 Deploy ready para reparacoeshistoricas.org:
- Plugin WordPress completo
- Scripts de deploy automatizado
- Documentação detalhada
- Configuração Hostinger preparada

📺 Canal: @ReparacoesHistoricas (UCRMRvNncp4fFy-27JD4Ph2w)
🎯 Objetivo: Amplificar vozes contra o racismo"

echo "✅ Commit criado com sucesso!"
echo ""
echo "🔗 Próximos passos para GitHub:"
echo "   1. Criar repositório no GitHub"
echo "   2. git remote add origin https://github.com/usuario/repo.git"
echo "   3. git branch -M main"
echo "   4. git push -u origin main"
echo ""
echo "📁 Arquivos incluídos:"
echo "   - Aplicação completa (client/, server/, shared/)"
echo "   - Plugin WordPress (wordpress-integration/)"
echo "   - Scripts de deploy (deployment/)"
echo "   - Documentação completa (README.md, DEPLOY-WORDPRESS.md)"
echo ""
echo "🎯 Pronto para produção em reparacoeshistoricas.org!"