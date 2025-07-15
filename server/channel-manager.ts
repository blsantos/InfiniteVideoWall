/**
 * Gerenciador de Canal YouTube
 * Facilita a troca de canal quando necessário
 */

import { YOUTUBE_CONFIG } from "./youtube-config";
import YouTubeService from "./youtube";
import { storage } from "./storage";

export class ChannelManager {
  
  /**
   * Verificar se canal existe e obter informações
   */
  static async verifyChannel(channelId: string) {
    try {
      const channelInfo = await YouTubeService.getChannelInfoById(channelId);
      return {
        exists: true,
        id: channelId,
        title: channelInfo.snippet?.title || 'Canal sem título',
        customUrl: channelInfo.snippet?.customUrl || null,
        description: channelInfo.snippet?.description || '',
        publishedAt: channelInfo.snippet?.publishedAt || null,
        thumbnails: channelInfo.snippet?.thumbnails || null,
        statistics: channelInfo.statistics || null
      };
    } catch (error) {
      console.error('Erro ao verificar canal:', error);
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Extrair Channel ID de diferentes formatos de URL
   */
  static extractChannelId(input: string): string | null {
    // Se já é um Channel ID válido
    if (input.match(/^UC[a-zA-Z0-9_-]{22}$/)) {
      return input;
    }
    
    // URL do canal: https://youtube.com/channel/UCxxxxx
    const channelMatch = input.match(/youtube\.com\/channel\/([UC][a-zA-Z0-9_-]{22})/);
    if (channelMatch) {
      return channelMatch[1];
    }
    
    // URL personalizada: https://youtube.com/@username
    const customMatch = input.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
    if (customMatch) {
      // Para URLs personalizadas, seria necessário usar a API Search
      // Por enquanto, retornamos null para indicar que precisa de busca manual
      return null;
    }
    
    return null;
  }
  
  /**
   * Buscar canal por nome de usuário (@username)
   */
  static async searchChannelByUsername(username: string) {
    try {
      // Remove @ se presente
      const cleanUsername = username.replace('@', '');
      
      // Buscar canal usando a API de busca
      const searchResults = await YouTubeService.searchChannels(cleanUsername);
      
      if (searchResults.items && searchResults.items.length > 0) {
        const channel = searchResults.items[0];
        return {
          found: true,
          channelId: channel.id?.channelId || channel.snippet?.channelId,
          title: channel.snippet?.title,
          customUrl: channel.snippet?.customUrl
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('Erro ao buscar canal:', error);
      return { found: false, error: error instanceof Error ? error.message : 'Erro na busca' };
    }
  }
  
  /**
   * Atualizar configuração do canal
   */
  static async updateChannel(newChannelId: string, channelName?: string) {
    try {
      // Verificar se o canal existe
      const verification = await this.verifyChannel(newChannelId);
      
      if (!verification.exists) {
        throw new Error(`Canal ${newChannelId} não encontrado`);
      }
      
      // Atualizar configuração
      YOUTUBE_CONFIG.updateChannel(
        newChannelId, 
        channelName || verification.title || '@Canal-Novo'
      );
      
      console.log('✅ Canal atualizado com sucesso:', {
        id: newChannelId,
        name: YOUTUBE_CONFIG.CHANNEL_NAME,
        title: verification.title
      });
      
      return {
        success: true,
        channelInfo: verification,
        config: {
          id: YOUTUBE_CONFIG.CHANNEL_ID,
          name: YOUTUBE_CONFIG.CHANNEL_NAME,
          url: YOUTUBE_CONFIG.CHANNEL_URL
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar canal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Sincronizar vídeos do novo canal
   */
  static async syncNewChannel(channelId: string) {
    try {
      const youtubeVideos = await YouTubeService.listChannelVideosByChannelId(channelId);
      let syncedCount = 0;
      let skippedCount = 0;
      
      for (const ytVideo of youtubeVideos.items || []) {
        const videoId = ytVideo.id?.videoId || ytVideo.id;
        
        if (!videoId || typeof videoId !== 'string') {
          continue;
        }
        
        // Verificar se o vídeo já existe
        const existingVideos = await storage.getVideos({ search: videoId });
        
        if (existingVideos.length === 0) {
          await storage.createVideo({
            youtubeId: videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: ytVideo.snippet?.title || 'Título não disponível',
            ageRange: "Não informado",
            gender: "Não informado",
            city: "Não informado",
            state: "Não informado",
            country: "Brasil",
            skinTone: "Não informado",
            racismType: "Outro",
            status: "approved"
          });
          syncedCount++;
        } else {
          skippedCount++;
        }
      }
      
      return {
        success: true,
        totalVideos: youtubeVideos.items?.length || 0,
        syncedVideos: syncedCount,
        skippedVideos: skippedCount
      };
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na sincronização'
      };
    }
  }
}

export default ChannelManager;