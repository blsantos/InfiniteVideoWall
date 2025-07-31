#!/bin/bash

# Deploy específico para VPS 46.202.175.252 - muro.reparacoeshistoricas.org
echo "🚀 Deploy Muro Infinito de Vídeos"
echo "VPS: 46.202.175.252"
echo "Domínio: muro.reparacoeshistoricas.org"
echo "=================================="

VPS_IP="46.202.175.252"
DOMAIN="muro.reparacoeshistoricas.org"
APP_DIR="/var/www/$DOMAIN"

# Verificar conexão SSH
echo "📡 Testando conexão SSH..."
if ! ping -c 1 $VPS_IP > /dev/null 2>&1; then
    echo "❌ VPS não acessível. Verificar:"
    echo "   - IP: $VPS_IP"
    echo "   - Firewall do VPS"
    echo "   - Conexão de rede"
    exit 1
fi

echo "✅ VPS acessível!"

# Instruções de upload
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Conectar ao VPS:"
echo "   ssh root@$VPS_IP"
echo ""
echo "2. Preparar sistema (executar no VPS):"
echo "   wget https://raw.githubusercontent.com/seu-repo/vps-deploy/install-vps.sh"
echo "   chmod +x install-vps.sh"
echo "   bash install-vps.sh"
echo ""
echo "3. Upload da aplicação (do seu computador):"
echo "   scp -r . root@$VPS_IP:$APP_DIR"
echo "   # OU usar SFTP/FileZilla"
echo ""
echo "4. Configurar aplicação (executar no VPS):"
echo "   cd $APP_DIR"
echo "   bash setup-app.sh"
echo ""
echo "5. Configurar .env (executar no VPS):"
echo "   nano $APP_DIR/.env"
echo "   # Adicionar credenciais PostgreSQL + YouTube"
echo ""
echo "🌐 DNS já configurado:"
echo "   A muro → $VPS_IP (TTL: 14400)"
echo ""
echo "🎯 URL final: https://$DOMAIN"
echo "📊 Canal: @ReparacoesHistoricas (3 vídeos ativos)"

# Verificar DNS
echo ""
echo "🔍 Verificando propagação DNS..."
if command -v nslookup > /dev/null 2>&1; then
    echo "Resultado nslookup:"
    nslookup $DOMAIN 2>/dev/null || echo "DNS ainda propagando..."
elif command -v dig > /dev/null 2>&1; then
    echo "Resultado dig:"
    dig +short $DOMAIN 2>/dev/null || echo "DNS ainda propagando..."
fi

echo ""
echo "⏱️  Tempo estimado total: 30-45 minutos"
echo "✅ Pronto para deploy!"