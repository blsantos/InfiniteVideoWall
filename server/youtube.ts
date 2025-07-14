import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const youtube = google.youtube('v3');

// Configuração OAuth2
const oauth2Client = new OAuth2Client(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/youtube/callback`
);

// Scopes necessários para upload
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly'
];

export interface YouTubeUploadOptions {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
}

export class YouTubeService {
  
  /**
   * Gera URL de autorização OAuth2
   */
  static getAuthUrl(state?: string): string {
    // Configurar redirect URI baseado no ambiente
    let baseUrl;
    
    if (process.env.NODE_ENV === 'production') {
      baseUrl = 'https://reparacoeshistoricas.org';
    } else if (process.env.REPLIT_DOMAINS) {
      baseUrl = `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
    } else {
      baseUrl = 'http://localhost:5000';
    }
    
    oauth2Client.redirectUri = `${baseUrl}/api/youtube/callback`;
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: state || 'youtube_auth',
      prompt: 'consent',
      include_granted_scopes: true
    });
  }

  /**
   * Troca código de autorização por tokens
   */
  static async getTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getAccessToken(code);
    return tokens;
  }

  /**
   * Faz upload de vídeo para o YouTube
   */
  static async uploadVideo(
    filePath: string,
    options: YouTubeUploadOptions,
    accessToken: string,
    refreshToken?: string
  ): Promise<{ videoId: string; url: string }> {
    
    // Configurar tokens
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const fileSize = fs.statSync(filePath).size;
    
    try {
      const response = await youtube.videos.insert({
        auth: oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: options.title,
            description: options.description,
            tags: options.tags,
            categoryId: options.categoryId || '22', // People & Blogs
            defaultLanguage: 'pt',
            defaultAudioLanguage: 'pt'
          },
          status: {
            privacyStatus: options.privacyStatus,
            embeddable: true,
            license: 'youtube',
            publicStatsViewable: false
          }
        },
        media: {
          body: fs.createReadStream(filePath)
        }
      });

      const videoId = response.data.id!;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return {
        videoId,
        url: videoUrl
      };

    } catch (error: any) {
      console.error('Erro no upload para YouTube:', error);
      
      // Tratar erros específicos
      if (error.code === 403) {
        throw new Error('Quota da API do YouTube excedida ou permissões insuficientes');
      } else if (error.code === 400) {
        throw new Error('Dados inválidos para upload no YouTube');
      } else if (error.code === 401) {
        throw new Error('Token de acesso expirado ou inválido');
      }
      
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }

  /**
   * Atualiza tokens usando refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  }

  /**
   * Verifica se vídeo existe no YouTube
   */
  static async getVideoInfo(videoId: string) {
    try {
      const response = await youtube.videos.list({
        auth: oauth2Client,
        part: ['snippet', 'status', 'statistics'],
        id: [videoId]
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
      return null;
    }
  }

  /**
   * Obtém informações do canal autenticado
   */
  static async getChannelInfo(accessToken: string) {
    try {
      oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await youtube.channels.list({
        auth: oauth2Client,
        part: ['snippet', 'statistics'],
        mine: true
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Erro ao obter informações do canal:', error);
      throw error;
    }
  }

  /**
   * Lista vídeos do canal por Channel ID (público, sem autenticação)
   */
  static async listChannelVideosByChannelId(channelId: string, maxResults = 50) {
    try {
      const response = await youtube.search.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet'],
        channelId: channelId,
        type: ['video'],
        maxResults,
        order: 'date'
      });

      return {
        items: response.data.items || []
      };
    } catch (error) {
      console.error('Erro ao listar vídeos do canal:', error);
      return {
        items: []
      };
    }
  }

  /**
   * Lista vídeos do canal autenticado
   */
  static async listChannelVideos(accessToken: string, maxResults = 50) {
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    try {
      const response = await youtube.search.list({
        auth: oauth2Client,
        part: ['snippet'],
        forMine: true,
        type: ['video'],
        maxResults,
        order: 'date'
      });

      return {
        items: response.data.items || []
      };
    } catch (error) {
      console.error('Erro ao listar vídeos:', error);
      return {
        items: []
      };
    }
  }

  /**
   * Obtém informações do canal por Channel ID (público)
   */
  static async getChannelInfoById(channelId: string) {
    try {
      const response = await youtube.channels.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet', 'statistics'],
        id: [channelId]
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Erro ao obter informações do canal:', error);
      throw error;
    }
  }

  /**
   * Valida formato de vídeo aceito pelo YouTube
   */
  static validateVideoFormat(filePath: string): boolean {
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'];
    const extension = path.extname(filePath).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  /**
   * Valida tamanho máximo (128GB para YouTube)
   */
  static validateFileSize(filePath: string): boolean {
    const maxSize = 128 * 1024 * 1024 * 1024; // 128GB
    const fileSize = fs.statSync(filePath).size;
    return fileSize <= maxSize;
  }

  /**
   * Cria uma playlist no YouTube
   */
  static async createPlaylist(accessToken: string, title: string, description: string, privacyStatus: 'private' | 'unlisted' | 'public' = 'public') {
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
      const response = await youtube.playlists.insert({
        auth: oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            defaultLanguage: 'pt'
          },
          status: {
            privacyStatus
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      throw error;
    }
  }

  /**
   * Lista playlists do canal
   */
  static async listPlaylists(accessToken: string) {
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
      const response = await youtube.playlists.list({
        auth: oauth2Client,
        part: ['snippet', 'status'],
        mine: true,
        maxResults: 50
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Erro ao listar playlists:', error);
      return [];
    }
  }

  /**
   * Adiciona vídeo a uma playlist
   */
  static async addVideoToPlaylist(accessToken: string, playlistId: string, videoId: string) {
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
      const response = await youtube.playlistItems.insert({
        auth: oauth2Client,
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId
            }
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar vídeo à playlist:', error);
      throw error;
    }
  }

  /**
   * Remove vídeo de uma playlist
   */
  static async removeVideoFromPlaylist(accessToken: string, playlistItemId: string) {
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
      await youtube.playlistItems.delete({
        auth: oauth2Client,
        id: playlistItemId
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover vídeo da playlist:', error);
      throw error;
    }
  }

  /**
   * Lista vídeos de uma playlist
   */
  static async getPlaylistVideos(accessToken: string, playlistId: string) {
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
      const response = await youtube.playlistItems.list({
        auth: oauth2Client,
        part: ['snippet'],
        playlistId,
        maxResults: 50
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Erro ao listar vídeos da playlist:', error);
      return [];
    }
  }
}

export default YouTubeService;