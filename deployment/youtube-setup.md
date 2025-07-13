# Configuração YouTube API - Muro Infinito de Vídeos

## Configuração do Google Cloud Console

### 1. Criar Projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Anote o ID do projeto

### 2. Ativar YouTube Data API v3
1. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
2. Procure por "YouTube Data API v3"
3. Clique em "Ativar"

### 3. Configurar OAuth 2.0
1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "ID do cliente OAuth 2.0"
3. Selecione "Aplicação da Web"
4. Configure:
   - **Nome**: Muro Infinito de Vídeos
   - **URLs de redirect autorizadas**: 
     - `https://seu-dominio.com/api/youtube/callback`
     - `http://localhost:5000/api/youtube/callback` (para desenvolvimento)

### 4. Obter Credenciais
Após criar, você receberá:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnop`

### 5. Criar Chave API (Opcional)
1. Clique em "Criar Credenciais" > "Chave da API"
2. Restrinja a chave para YouTube Data API v3

## Configuração no Servidor

### Variáveis de Ambiente
```env
# YouTube API Credentials
YOUTUBE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"
YOUTUBE_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456" # Opcional

# URLs para redirect
REPLIT_DOMAINS="seu-dominio.com"
```

### Configuração OAuth Consent Screen
1. Vá em "APIs e Serviços" > "Tela de permissão OAuth"
2. Configure:
   - **Tipo**: Externo (para produção)
   - **Nome do App**: Muro Infinito de Vídeos
   - **Email de suporte**: seu-email@dominio.com
   - **Logo**: (opcional)
   - **Domínios autorizados**: `seu-dominio.com`
   - **Link de privacidade**: `https://seu-dominio.com/privacy`
   - **Link de termos**: `https://seu-dominio.com/terms`

3. **Escopos necessários**:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`

## Fluxo de Funcionamento

### 1. Autorização do Usuário
```javascript
// Frontend: Botão "Autorizar YouTube"
GET /api/youtube/auth
// Redireciona para Google OAuth
```

### 2. Callback de Autorização
```javascript
// Google redireciona para:
GET /api/youtube/callback?code=abc123&state={}
// Servidor troca código por tokens
```

### 3. Upload do Vídeo
```javascript
// Frontend envia vídeo
POST /api/videos (multipart/form-data)
// Servidor faz upload para YouTube
// Salva metadados no banco
```

## Configuração de Produção

### Domínios Autorizados
Adicione todos os domínios onde a aplicação rodará:
```
- reparacoeshistoricas.org
- www.reparacoeshistoricas.org
- videos.reparacoeshistoricas.org
```

### Políticas de Privacidade
Crie páginas obrigatórias:
- **Política de Privacidade**: Como os dados são usados
- **Termos de Serviço**: Regras de uso da plataforma

### Verificação do App
Para uso em produção:
1. Google pode solicitar verificação
2. Processo pode levar algumas semanas
3. Envie documentação do projeto

## Limites e Quotas

### API Quotas (Gratuito)
- **Upload de vídeos**: 6 uploads/dia por usuário
- **Operações de leitura**: 10.000 unidades/dia
- **Total de quota**: 10.000 unidades/dia

### Aumentar Quotas
1. Acesse "APIs e Serviços" > "Quotas"
2. Solicite aumento via formulário
3. Justifique o uso para projeto social

## Troubleshooting

### Erros Comuns

#### 1. "redirect_uri_mismatch"
```
Solução: Verificar URLs de callback no Google Console
Deve ser EXATAMENTE: https://seu-dominio.com/api/youtube/callback
```

#### 2. "access_denied"
```
Solução: Usuário negou permissão ou app não verificado
Verificar OAuth Consent Screen
```

#### 3. "quotaExceeded"
```
Solução: Quota da API excedida
Implementar retry com backoff exponencial
Solicitar aumento de quota
```

#### 4. "unauthorized"
```
Solução: Token expirado ou inválido
Implementar refresh token
Solicitar nova autorização
```

### Logs Úteis
```javascript
// Server logs para debug
console.log('YouTube upload error:', error);
console.log('Token status:', tokens);
console.log('File details:', fileInfo);
```

## Exemplo de Implementação

### Client-Side
```javascript
// Autorizar YouTube
const authorizeYoutube = async () => {
  const response = await fetch('/api/youtube/auth');
  const data = await response.json();
  window.location.href = data.authUrl;
};

// Upload com progresso
const uploadVideo = async (formData) => {
  const response = await fetch('/api/videos', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.needsAuth) {
      // Mostrar botão de autorização
      return { needsAuth: true, authUrl: error.authUrl };
    }
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### Server-Side
```javascript
// Upload para YouTube
const uploadResult = await YouTubeService.uploadVideo(
  filePath,
  {
    title: videoData.title,
    description: videoData.description,
    tags: ['racismo', 'relato', 'brasil'],
    privacyStatus: 'unlisted'
  },
  accessToken,
  refreshToken
);

// Salvar no banco
const video = await storage.createVideo({
  ...videoData,
  youtubeId: uploadResult.videoId,
  youtubeUrl: uploadResult.url
});
```

## Monitoramento

### Métricas Importantes
- Taxa de uploads bem-sucedidos
- Tempo médio de upload
- Erros por tipo
- Uso de quota da API

### Alertas
- Quota próxima do limite (80%)
- Taxa de erro alta (>10%)
- Tempo de upload longo (>5 min)

## Backup e Redundância

### Estratégias
1. **Fallback**: Se YouTube falhar, salvar vídeo localmente
2. **Retry**: Tentar novamente em caso de erro temporário
3. **Queue**: Sistema de fila para uploads em batch
4. **CDN**: Cache de thumbnails e metadados