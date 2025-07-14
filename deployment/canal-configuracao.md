# Configuração do Canal YouTube @ReparacoesHistoricasBrasil

## Canal de Destino Confirmado

**Canal:** @ReparacoesHistoricasBrasil  
**URL:** https://youtube.com/@ReparacoesHistoricasBrasil  
**Tipo:** Canal oficial do projeto  

## Como Configurar

### 1. Autorização Inicial
```
1. Administrador acessa o sistema
2. Vai em "Upload" ou "Admin"
3. Clica em "Autorizar YouTube"
4. Faz login com a conta @ReparacoesHistoricasBrasil
5. Autoriza as permissões solicitadas
```

### 2. Processo de Upload
```
1. Usuário faz upload de vídeo
2. Sistema verifica se YouTube está autorizado
3. Se não: solicita autorização
4. Se sim: envia vídeo para @ReparacoesHistoricasBrasil
5. Vídeo fica "unlisted" (não listado)
6. Admin modera no painel
```

### 3. Status dos Vídeos
```
- Upload: "unlisted" (não listado)
- Aprovado: permanece "unlisted" mas aparece no muro
- Rejeitado: não aparece no muro público
- Admin pode tornar "public" manualmente no YouTube
```

## Verificação do Canal

Para confirmar que está configurado corretamente:

1. **No Admin Panel:**
   - Acesse `/admin`
   - Vá na aba "Configurações"
   - Deve mostrar o canal autorizado

2. **Teste de Upload:**
   - Faça upload de um vídeo teste
   - Verifique se aparece no canal @ReparacoesHistoricasBrasil
   - Confirme que está "unlisted"

3. **Via API:**
```bash
curl -X GET "http://localhost:5000/api/youtube/channel-info" \
  -H "Cookie: connect.sid=..." \
  -b cookies.txt
```

## Configurações Recomendadas

### No Canal YouTube:
- **Privacidade:** Todos os uploads como "unlisted" por padrão
- **Monetização:** Desabilitada para vídeos de relatos
- **Comentários:** Moderados ou desabilitados
- **Legendas:** Português automático habilitado

### No Sistema:
- **Upload máximo:** 2GB por vídeo
- **Duração máxima:** 60 segundos
- **Formatos aceitos:** MP4, AVI, MOV, WMV
- **Moderação:** Todos os vídeos passam por aprovação

## Fluxo Completo

### 1. Usuário Comum
```
1. Acessa via QR code do livro
2. Vê muro de vídeos do capítulo
3. Clica em "Compartilhar Experiência"
4. Preenche formulário + upload vídeo
5. Sistema pede autorização YouTube (se necessário)
6. Vídeo vai para moderação
```

### 2. Administrador
```
1. Login como admin
2. Acessa painel administrativo
3. Aba "Moderação" lista vídeos pendentes
4. Assiste vídeo + vê dados demográficos
5. Aprova/rejeita com motivo
6. Vídeo aprovado aparece no muro
```

### 3. Canal YouTube
```
1. Recebe todos os uploads automaticamente
2. Vídeos ficam "unlisted" por padrão
3. Admin pode tornar públicos manualmente
4. Organizar em playlists por capítulo/tema
5. Backup automático de todo conteúdo
```

## Segurança e Privacidade

### Proteções Implementadas:
- ✅ Vídeos não listados por padrão
- ✅ Moderação obrigatória antes da publicação
- ✅ Dados demográficos protegidos (não no YouTube)
- ✅ Sistema de backup no banco PostgreSQL
- ✅ OAuth2 seguro para autorização

### Políticas do YouTube Respeitadas:
- ✅ Conteúdo educacional/conscientização
- ✅ Relatos pessoais permitidos
- ✅ Sem monetização em vídeos sensíveis
- ✅ Moderação ativa contra abuso

## Troubleshooting

### Problemas Comuns:

1. **"Autorização necessária"**
   - Solução: Refazer OAuth2 com conta correta

2. **"Quota excedida"**
   - Solução: Aguardar reset diário ou solicitar aumento

3. **"Formato não suportado"**
   - Solução: Converter para MP4 antes do upload

4. **"Vídeo não aparece no canal"**
   - Solução: Verificar se está "unlisted" no YouTube Studio