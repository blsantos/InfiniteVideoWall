# Comandos Úteis - VPS 46.202.175.252

## Conexão SSH
```bash
ssh root@46.202.175.252
```

## Upload de Arquivos
```bash
# Upload completo da aplicação
scp -r . root@46.202.175.252:/var/www/muro.reparacoeshistoricas.org/

# Upload individual de arquivo
scp arquivo.txt root@46.202.175.252:/var/www/muro.reparacoeshistoricas.org/

# Upload via rsync (mais eficiente)
rsync -avz --exclude node_modules . root@46.202.175.252:/var/www/muro.reparacoeshistoricas.org/
```

## Gerenciamento da Aplicação
```bash
# Ver status
sudo -u nodeapp pm2 status

# Ver logs em tempo real
sudo -u nodeapp pm2 logs muro-videos

# Restart da aplicação
sudo -u nodeapp pm2 restart muro-videos

# Parar aplicação
sudo -u nodeapp pm2 stop muro-videos

# Iniciar aplicação
sudo -u nodeapp pm2 start muro-videos
```

## Gerenciamento do Servidor
```bash
# Status Nginx
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# Ver logs Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Status PostgreSQL
systemctl status postgresql

# Conectar PostgreSQL
sudo -u postgres psql muro_videos
```

## Monitoramento
```bash
# CPU e Memória
top
htop

# Espaço em disco
df -h

# Processos Node.js
ps aux | grep node

# Portas abertas
netstat -tulpn | grep :3000
netstat -tulpn | grep :80
```

## SSL / Certificados
```bash
# Renovar certificado
certbot renew

# Status certificado
certbot certificates

# Testar renovação
certbot renew --dry-run
```

## Backup
```bash
# Backup database
sudo -u postgres pg_dump muro_videos > backup_$(date +%Y%m%d).sql

# Backup aplicação
tar -czf backup_app_$(date +%Y%m%d).tar.gz /var/www/muro.reparacoeshistoricas.org/
```

## Troubleshooting
```bash
# Verificar se aplicação está rodando
curl http://localhost:3000/api/videos

# Verificar DNS
nslookup muro.reparacoeshistoricas.org
dig muro.reparacoeshistoricas.org

# Verificar conectividade
ping muro.reparacoeshistoricas.org

# Logs detalhados
journalctl -u nginx
journalctl -f
```

## URLs de Teste
- **Local:** http://localhost:3000
- **Público:** https://muro.reparacoeshistoricas.org
- **API:** https://muro.reparacoeshistoricas.org/api/videos
- **Admin:** https://muro.reparacoeshistoricas.org/admin