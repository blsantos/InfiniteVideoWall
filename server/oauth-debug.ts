// Debug OAuth Configuration
export const OAUTH_DEBUG = {
  // URLs de redirect necessárias no Google Console
  redirectUrls: [
    'https://883149f1-1c75-46d3-8a00-b3d17d4dda1d-00-zh6zir2txvr9.worf.replit.dev/api/youtube/callback',
    'https://reparacoeshistoricas.org/api/youtube/callback',
    'http://localhost:5000/api/youtube/callback'
  ],
  
  // Usuários de teste que precisam ser adicionados
  testUsers: [
    'contact@b2santos.fr'
  ],
  
  // Scopes necessários
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly'
  ],
  
  // Configurações do app
  appStatus: 'testing', // Mudar para 'published' quando pronto
  
  // Instruções para resolver erro 403
  instructions: [
    '1. Acesse Google Cloud Console',
    '2. Vá para APIs & Services > Credentials',
    '3. Selecione o OAuth 2.0 Client ID',
    '4. Adicione as URLs de redirect acima',
    '5. Vá para OAuth consent screen',
    '6. Adicione contact@b2santos.fr como Test User',
    '7. Certifique-se que o app está em modo Testing',
    '8. Verifique se as APIs YouTube estão habilitadas'
  ]
};

console.log('OAuth Debug Configuration:', OAUTH_DEBUG);