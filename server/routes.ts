import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, updateVideoStatusSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import multer from "multer";
import YouTubeService from "./youtube";
import { YOUTUBE_CONFIG } from "./youtube-config";
import ChannelManager from "./channel-manager";
import fs from "fs";
import path from "path";

// Configurar upload temporário
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/temp';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de vídeo não suportado'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limite
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chapter routes
  app.get('/api/chapters', async (req, res) => {
    try {
      const chapters = await storage.getChapters();
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get('/api/chapters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapter = await storage.getChapter(id);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  app.post('/api/chapters', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const chapter = await storage.createChapter(req.body);
      res.json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // QR Code routes
  app.post('/api/chapters/:id/qr-code', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
      const url = `https://${baseUrl}/capitulo/${id}`;
      
      const qrCode = await QRCode.toDataURL(url);
      const chapter = await storage.updateChapterQRCode(id, qrCode);
      
      res.json(chapter);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const { chapterId, status, racismType, location, search, category, limit = '20', offset = '0' } = req.query;
      
      const filters: any = {};
      if (chapterId) filters.chapterId = parseInt(chapterId as string);
      if (status) filters.status = status as string;
      if (racismType) filters.racismType = racismType as string;
      if (location) filters.location = location as string;
      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      
      filters.limit = parseInt(limit as string);
      filters.offset = parseInt(offset as string);
      
      const videos = await storage.getVideos(filters);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // YouTube OAuth routes
  app.get('/api/youtube/auth', (req: any, res) => {
    const state = 'youtube_auth_' + Date.now();
    req.session.youtubeAuthState = state;
    const authUrl = YouTubeService.getAuthUrl(state);
    res.json({ authUrl });
  });

  // YouTube callback - processar retorno da autorização
  app.get('/api/youtube/callback', async (req: any, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        console.error('Erro na autorização YouTube:', error);
        return res.redirect('/admin?youtube_error=' + encodeURIComponent(error));
      }
      
      if (!code) {
        return res.redirect('/admin?youtube_error=no_code');
      }
      
      console.log('YouTube callback recebido com código:', code.substring(0, 10) + '...');
      
      // Trocar código por tokens
      const tokens = await YouTubeService.getTokensFromCode(code as string);
      console.log('Tokens obtidos com sucesso:', !!tokens.access_token);
      
      // Salvar tokens na sessão
      req.session.youtubeTokens = tokens;
      
      // Redirecionar para o admin com sucesso
      res.redirect('/admin?youtube_success=true');
      
    } catch (error: any) {
      console.error('Erro no callback YouTube:', error);
      res.redirect('/admin?youtube_error=' + encodeURIComponent(error.message));
    }
  });

  // Verificar informações do canal YouTube
  app.get('/api/youtube/channel-info', async (req: any, res) => {
    try {
      const tokens = req.session.youtubeTokens;
      
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária',
          needsAuth: true 
        });
      }

      const channelInfo = await YouTubeService.getChannelInfo(tokens.access_token!);
      res.json(channelInfo);
    } catch (error) {
      console.error('Erro ao obter informações do canal:', error);
      res.status(500).json({ message: 'Erro ao obter informações do canal' });
    }
  });

  // Listar vídeos do canal YouTube
  app.get('/api/youtube/videos', async (req: any, res) => {
    try {
      const tokens = req.session.youtubeTokens;
      
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária',
          needsAuth: true 
        });
      }

      const videos = await YouTubeService.listChannelVideos(tokens.access_token!);
      res.json(videos);
    } catch (error) {
      console.error('Erro ao listar vídeos do canal:', error);
      res.status(500).json({ message: 'Erro ao listar vídeos do canal' });
    }
  });

  // Sincronizar vídeos do YouTube com o banco de dados (usando Channel ID público)
  app.post('/api/youtube/sync', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Usar Channel ID público do novo canal
      const channelId = YOUTUBE_CONFIG.CHANNEL_ID;
      
      const youtubeVideos = await YouTubeService.listChannelVideosByChannelId(channelId);
      let syncedCount = 0;
      let skippedCount = 0;

      for (const ytVideo of youtubeVideos.items || []) {
        // Extrair o videoId correto do objeto
        const videoId = ytVideo.id?.videoId || ytVideo.id;
        
        if (!videoId || typeof videoId !== 'string') {
          console.log('ID de vídeo inválido:', ytVideo.id);
          continue;
        }
        
        // Verificar se o vídeo já existe no banco (busca exata por youtube_id)
        const existingVideos = await storage.getVideos({ search: videoId });
        
        if (existingVideos.length === 0) {
          // Criar novo vídeo no banco com dados básicos
          const newVideo = await storage.createVideo({
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
            status: "approved" // Assumir aprovado se já está no canal
          });
          syncedCount++;
          console.log(`Vídeo sincronizado: ${videoId} - ${ytVideo.snippet?.title}`);
        } else {
          skippedCount++;
          console.log(`Vídeo já existe: ${videoId} - ${ytVideo.snippet?.title}`);
        }
      }

      res.json({ 
        message: `${syncedCount} vídeos sincronizados, ${skippedCount} já existiam`,
        totalVideos: youtubeVideos.items?.length || 0,
        syncedVideos: syncedCount,
        skippedVideos: skippedCount,
        channelId: channelId
      });
    } catch (error) {
      console.error('Erro ao sincronizar vídeos:', error);
      res.status(500).json({ message: 'Erro ao sincronizar vídeos' });
    }
  });

  // Verificar informações do canal público
  app.get('/api/youtube/channel-public', async (req, res) => {
    try {
      const channelId = YOUTUBE_CONFIG.CHANNEL_ID;
      const channelInfo = await YouTubeService.getChannelInfoById(channelId);
      
      if (!channelInfo) {
        return res.status(404).json({ message: 'Canal não encontrado' });
      }

      res.json({
        ...channelInfo,
        channelUrl: `https://www.youtube.com/channel/${channelId}`
      });
    } catch (error) {
      console.error('Erro ao obter informações do canal público:', error);
      res.status(500).json({ message: 'Erro ao obter informações do canal' });
    }
  });

  // Gerenciamento de Playlists YouTube
  app.get('/api/youtube/playlists', async (req: any, res) => {
    try {
      const tokens = req.session.youtubeTokens;
      
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária',
          needsAuth: true 
        });
      }

      const playlists = await YouTubeService.listPlaylists(tokens.access_token!);
      res.json(playlists);
    } catch (error) {
      console.error('Erro ao listar playlists:', error);
      res.status(500).json({ message: 'Erro ao listar playlists' });
    }
  });

  // Criar playlist para categoria
  app.post('/api/youtube/playlists', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tokens = req.session.youtubeTokens;
      
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária',
          needsAuth: true 
        });
      }

      const { title, description, category } = req.body;

      const playlist = await YouTubeService.createPlaylist(
        tokens.access_token!,
        title,
        description,
        'public'
      );

      // Atualizar capítulos com a categoria correspondente
      if (category && playlist.id) {
        const chapters = await storage.getChapters();
        const categoryChapters = chapters.filter(c => c.category === category);
        
        for (const chapter of categoryChapters) {
          await storage.updateChapterPlaylist(
            chapter.id, 
            playlist.id, 
            `https://www.youtube.com/playlist?list=${playlist.id}`
          );
        }
      }

      res.json(playlist);
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      res.status(500).json({ message: 'Erro ao criar playlist' });
    }
  });

  // Adicionar vídeo à playlist da categoria
  app.post('/api/youtube/playlists/:playlistId/videos', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tokens = req.session.youtubeTokens;
      
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária',
          needsAuth: true 
        });
      }

      const { playlistId } = req.params;
      const { videoId } = req.body;

      const result = await YouTubeService.addVideoToPlaylist(
        tokens.access_token!,
        playlistId,
        videoId
      );

      res.json(result);
    } catch (error) {
      console.error('Erro ao adicionar vídeo à playlist:', error);
      res.status(500).json({ message: 'Erro ao adicionar vídeo à playlist' });
    }
  });

  // Limpar vídeos inválidos
  app.post('/api/youtube/cleanup-invalid', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Buscar vídeos com problemas
      const allVideos = await storage.getVideos({});
      let deletedCount = 0;

      for (const video of allVideos) {
        const hasInvalidId = !video.youtubeId || 
                            typeof video.youtubeId !== 'string' || 
                            video.youtubeId.includes('kind') ||
                            video.youtubeId.includes('{');
        
        const hasInvalidUrl = !video.youtubeUrl || 
                             video.youtubeUrl.includes('[object Object]');

        if (hasInvalidId || hasInvalidUrl) {
          await storage.deleteVideo(video.id);
          deletedCount++;
        }
      }

      res.json({ 
        message: `${deletedCount} vídeos inválidos removidos`,
        deletedCount
      });
    } catch (error) {
      console.error('Erro ao limpar vídeos:', error);
      res.status(500).json({ message: 'Erro ao limpar vídeos' });
    }
  });

  app.get('/api/youtube/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ message: 'Código de autorização ausente' });
      }

      const tokens = await YouTubeService.getTokensFromCode(code as string);
      
      // Salvar tokens na sessão (temporário)
      (req as any).session.youtubeTokens = tokens;
      
      // Redirecionar de volta para a página de upload
      res.redirect('/upload?youtube=success');
    } catch (error) {
      console.error('Erro no callback YouTube:', error);
      res.redirect('/upload?youtube=error');
    }
  });

  // Upload de vídeo com integração YouTube
  app.post('/api/videos', upload.single('video'), async (req: any, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      let youtubeVideoId = null;
      let youtubeUrl = null;

      // Se há arquivo de vídeo, fazer upload para YouTube
      if (req.file) {
        const tokens = req.session.youtubeTokens;
        
        if (!tokens) {
          return res.status(400).json({ 
            message: 'Autorização do YouTube necessária',
            needsAuth: true,
            authUrl: YouTubeService.getAuthUrl()
          });
        }

        try {
          // Validar arquivo
          if (!YouTubeService.validateVideoFormat(req.file.path)) {
            fs.unlinkSync(req.file.path); // Limpar arquivo
            return res.status(400).json({ message: 'Formato de vídeo não suportado' });
          }

          if (!YouTubeService.validateFileSize(req.file.path)) {
            fs.unlinkSync(req.file.path); // Limpar arquivo
            return res.status(400).json({ message: 'Arquivo muito grande (máximo 2GB)' });
          }

          // Fazer upload para YouTube
          const uploadResult = await YouTubeService.uploadVideo(
            req.file.path,
            {
              title: videoData.title,
              description: `${videoData.description}\n\nCompartilhado em reparacoeshistoricas.org`,
              tags: ['racismo', 'relato', 'experiencia', 'brasil', videoData.racismType],
              privacyStatus: 'unlisted' // Não listado por padrão
            },
            tokens.access_token!,
            tokens.refresh_token
          );

          youtubeVideoId = uploadResult.videoId;
          youtubeUrl = uploadResult.url;

          // Limpar arquivo temporário
          fs.unlinkSync(req.file.path);

        } catch (uploadError: any) {
          console.error('Erro no upload YouTube:', uploadError);
          
          // Limpar arquivo temporário
          if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(500).json({ 
            message: `Erro no upload para YouTube: ${uploadError.message}`,
            youtubeError: true
          });
        }
      }

      // Salvar no banco com informações do YouTube
      const finalVideoData = {
        ...videoData,
        youtubeId: youtubeVideoId,
        youtubeUrl: youtubeUrl,
        status: 'pending' as const
      };

      const video = await storage.createVideo(finalVideoData);
      res.json({ 
        ...video, 
        youtubeUploaded: !!youtubeVideoId,
        youtubeUrl 
      });

    } catch (error: any) {
      console.error("Error creating video:", error);
      
      // Limpar arquivo temporário em caso de erro
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // Remover rota duplicada - usar apenas /api/admin/videos/:id/status

  app.delete('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteVideo(id);
      
      if (success) {
        res.json({ message: "Video deleted successfully" });
      } else {
        res.status(404).json({ message: "Video not found" });
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Statistics routes
  app.get('/api/statistics/overview', async (req, res) => {
    try {
      const stats = await storage.getVideoStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin Statistics Routes (protected)
  app.get('/api/admin/stats/overview', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getVideoStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get('/api/admin/stats/location', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getVideosByLocation();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching location stats:", error);
      res.status(500).json({ message: "Failed to fetch location statistics" });
    }
  });

  app.get('/api/admin/stats/racism-type', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getVideosByRacismType();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching racism type stats:", error);
      res.status(500).json({ message: "Failed to fetch racism type statistics" });
    }
  });

  app.get('/api/admin/stats/age', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getVideosByAge();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching age stats:", error);
      res.status(500).json({ message: "Failed to fetch age statistics" });
    }
  });

  app.get('/api/admin/stats/gender', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getVideosByGender();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching gender stats:", error);
      res.status(500).json({ message: "Failed to fetch gender statistics" });
    }
  });

  // Admin Video Management Routes
  app.get('/api/admin/videos', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { status, racismType, location, search } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (racismType) filters.racismType = racismType;
      if (location) filters.location = location;
      if (search) filters.search = search;
      
      const videos = await storage.getVideos(filters);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.patch('/api/admin/videos/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const videoId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updateData: any = { status };
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      const updatedVideo = await storage.updateVideoStatus(videoId, updateData, req.user.claims.sub);
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video status:", error);
      res.status(500).json({ message: "Failed to update video status" });
    }
  });

  app.get('/api/statistics/location', async (req, res) => {
    try {
      const stats = await storage.getVideosByLocation();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching location statistics:", error);
      res.status(500).json({ message: "Failed to fetch location statistics" });
    }
  });

  app.get('/api/statistics/racism-type', async (req, res) => {
    try {
      const stats = await storage.getVideosByRacismType();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching racism type statistics:", error);
      res.status(500).json({ message: "Failed to fetch racism type statistics" });
    }
  });

  app.get('/api/statistics/age', async (req, res) => {
    try {
      const stats = await storage.getVideosByAge();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching age statistics:", error);
      res.status(500).json({ message: "Failed to fetch age statistics" });
    }
  });

  app.get('/api/statistics/gender', async (req, res) => {
    try {
      const stats = await storage.getVideosByGender();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching gender statistics:", error);
      res.status(500).json({ message: "Failed to fetch gender statistics" });
    }
  });

  // Chapter access routes (for QR codes)
  app.get('/capitulo/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const chapter = await storage.getChapter(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    // Redirect to frontend chapter page
    res.redirect(`/#/chapter/${id}`);
  });

  // 🆕 TROCAR CANAL YOUTUBE - Nova rota para configurar novo canal
  app.post('/api/youtube/change-channel', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { channelInput, channelName } = req.body;
      
      if (!channelInput) {
        return res.status(400).json({ 
          message: 'Channel ID, URL ou @username é obrigatório' 
        });
      }

      let channelId = ChannelManager.extractChannelId(channelInput);
      
      // Se não conseguiu extrair, pode ser um @username
      if (!channelId && channelInput.includes('@')) {
        const searchResult = await ChannelManager.searchChannelByUsername(channelInput);
        if (searchResult.found) {
          channelId = searchResult.channelId;
        }
      }
      
      if (!channelId) {
        return res.status(400).json({ 
          message: 'Formato inválido. Use Channel ID (UCxxxxx), URL do canal ou @username'
        });
      }

      // Atualizar canal
      const result = await ChannelManager.updateChannel(channelId, channelName);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: result.error || 'Erro ao atualizar canal'
        });
      }

      // Sincronizar vídeos do novo canal
      const syncResult = await ChannelManager.syncNewChannel(channelId);

      res.json({
        message: 'Canal atualizado com sucesso!',
        channel: result.config,
        channelInfo: result.channelInfo,
        sync: syncResult
      });

    } catch (error: any) {
      console.error('Erro ao trocar canal:', error);
      res.status(500).json({ message: 'Erro interno: ' + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
