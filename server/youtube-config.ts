/**
 * Configuração do Canal YouTube
 * Centralizador de configurações do canal para fácil atualização
 */

export const YOUTUBE_CONFIG = {
  // Canal atual - ATUALIZAR QUANDO TROCAR O CANAL
  CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID || 'UCzpIDynWSNfGx4djJS_DFiQ',
  CHANNEL_NAME: '@ReparacoesHistoricasBrasil',
  CHANNEL_URL: 'https://www.youtube.com/channel/UCzpIDynWSNfGx4djJS_DFiQ',
  
  // OAuth2 Configuration
  CLIENT_ID: process.env.YOUTUBE_CLIENT_ID!,
  CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET!,
  
  // API Configuration
  API_KEY: process.env.YOUTUBE_API_KEY!,
  
  // Validation
  validateConfig() {
    const missing = [];
    if (!this.CLIENT_ID) missing.push('YOUTUBE_CLIENT_ID');
    if (!this.CLIENT_SECRET) missing.push('YOUTUBE_CLIENT_SECRET');
    if (!this.API_KEY) missing.push('YOUTUBE_API_KEY');
    
    if (missing.length > 0) {
      throw new Error(`YouTube config missing: ${missing.join(', ')}`);
    }
  },
  
  // Atualizar canal
  updateChannel(channelId: string, channelName?: string) {
    this.CHANNEL_ID = channelId;
    this.CHANNEL_NAME = channelName || `@Canal-${channelId.substring(2, 8)}`;
    this.CHANNEL_URL = `https://www.youtube.com/channel/${channelId}`;
    
    console.log('Canal YouTube atualizado:', {
      id: this.CHANNEL_ID,
      name: this.CHANNEL_NAME,
      url: this.CHANNEL_URL
    });
  }
};

// Validar configuração na inicialização
try {
  YOUTUBE_CONFIG.validateConfig();
  console.log('✅ Configuração YouTube válida:', {
    channelId: YOUTUBE_CONFIG.CHANNEL_ID,
    channelName: YOUTUBE_CONFIG.CHANNEL_NAME
  });
} catch (error) {
  console.warn('⚠️ Configuração YouTube incompleta:', error);
}