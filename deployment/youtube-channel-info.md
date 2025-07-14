# Informações do Canal YouTube - Muro Infinito de Vídeos

## Para onde os vídeos são enviados

### Canal de Destino
Os vídeos são enviados para o canal **@ReparacoesHistoricasBrasil**.

**Como funciona:**
1. Usuário clica em "Autorizar YouTube"
2. Sistema redireciona para Google OAuth
3. Usuário faz login na conta **@ReparacoesHistoricasBrasil**
4. Vídeos são enviados para esse canal oficial

### Configuração Recomendada

#### Canal Configurado: @ReparacoesHistoricasBrasil
```
✅ Canal oficial já existe
✅ URL: https://youtube.com/@ReparacoesHistoricasBrasil
✅ Todos os vídeos são enviados para este canal
✅ Configuração OAuth2 deve usar as credenciais desta conta
```

### Status de Privacidade dos Vídeos

#### Configuração Atual: "unlisted" (Não listados)
- ✅ Vídeos não aparecem em pesquisas públicas
- ✅ Só podem ser vistos com link direto
- ✅ Ideal para moderação antes de publicar
- ✅ Podem ser incorporados em sites

#### Fluxo de Moderação:
1. **Upload**: Vídeo fica "unlisted" automaticamente
2. **Moderação**: Admin aprova/rejeita no painel
3. **Aprovação**: Vídeo permanece "unlisted" mas aparece no muro
4. **Opcional**: Admin pode tornar "public" manualmente no YouTube

### Verificar Canal Atual

Para saber qual canal está configurado:
```javascript
// Frontend
fetch('/api/youtube/channel-info')
  .then(res => res.json())
  .then(data => {
    console.log('Canal:', data.snippet.title);
    console.log('URL:', `https://youtube.com/channel/${data.id}`);
  });
```

### Configurar Canal Oficial

#### 1. Criar Canal Dedicado
```
1. Acesse studio.youtube.com
2. Crie novo canal: "Reparações Históricas"
3. Configure:
   - Descrição: "Relatos de experiências de racismo no Brasil"
   - Banner: Logo do projeto
   - Informações de contato
```

#### 2. Configurar OAuth2
```
1. Google Cloud Console
2. Adicionar domínio autorizado
3. Testar autorização com nova conta
```

#### 3. Teste de Upload
```bash
# Fazer upload teste
curl -X POST "http://localhost:5000/api/videos" \
  -F "video=@teste.mp4" \
  -F "title=Teste Upload" \
  -F "ageRange=25-35" \
  -F "gender=M" \
  -F "city=São Paulo" \
  -F "state=SP" \
  -F "skinTone=Preta" \
  -F "racismType=Teste"
```

### Verificações de Segurança

#### Quotas YouTube
- Uploads gratuitos: 6 vídeos/dia
- Quota API: 10.000 unidades/dia
- Para mais: solicitar aumento

#### Políticas de Conteúdo
- Vídeos sobre experiências pesais: ✅ Permitido
- Conteúdo educacional/conscientização: ✅ Permitido
- Relatos de discriminação: ✅ Permitido (com moderação)

#### Backup e Redundância
- Vídeos ficam salvos no YouTube
- Metadados salvos no banco PostgreSQL
- Sistema de moderação interno
- Possibilidade de download/backup

### Próximos Passos

1. **Definir Canal Oficial**
   - Criar conta dedicada ou usar existente
   - Configurar canal com identidade visual

2. **Testar Upload Completo**
   - Autorizar com conta correta
   - Fazer upload de vídeo teste
   - Verificar se aparece no canal

3. **Configurar Moderação**
   - Treinar moderadores
   - Definir critérios de aprovação
   - Testar fluxo completo

4. **Deploy em Produção**
   - Configurar domínio final
   - Atualizar OAuth2 redirect URLs
   - Testar em ambiente de produção