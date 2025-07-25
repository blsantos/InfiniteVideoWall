import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, updateVideoStatusSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import multer from "multer";
import { YouTubeService } from "./youtube";
import { YOUTUBE_CONFIG } from "./youtube-config";
import { ChannelManager } from "./channel-manager";
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

  app.post('/api/chapters', isAuthenticated, async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const qrCodeData = `${req.protocol}://${req.get('host')}/chapter/${title}`;
      const qrCode = await QRCode.toDataURL(qrCodeData);

      const chapter = await storage.createChapter({
        title,
        description,
        category,
        qrCode,
      });

      res.json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const { status, racismType, location, search, chapterId } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (racismType) filters.racismType = racismType;
      if (location) filters.location = location;
      if (search) filters.search = search;
      if (chapterId) filters.chapterId = parseInt(chapterId as string);
      
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
  app.get('/api/youtube/auth', isAuthenticated, async (req: any, res) => {
    try {
      const authUrl = await YouTubeService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Erro ao gerar URL de autorização:', error);
      res.status(500).json({ message: 'Erro ao gerar URL de autorização' });
    }
  });

  app.get('/api/youtube/callback', async (req: any, res) => {
    try {
      const { code, error: authError } = req.query;
      
      if (authError) {
        console.error('Erro de autorização:', authError);
        return res.redirect('/admin?youtube_error=' + encodeURIComponent(authError));
      }
      
      if (!code) {
        return res.redirect('/admin?youtube_error=no_code');
      }
      
      console.log('YouTube callback recebido com código:', code.substring(0, 10) + '...');
      
      const tokens = await YouTubeService.getTokensFromCode(code as string);
      console.log('Tokens obtidos com sucesso:', !!tokens.access_token);
      
      req.session.youtubeTokens = tokens;
      
      res.redirect('/admin?youtube_success=true');
      
    } catch (error: any) {
      console.error('Erro no callback YouTube:', error);
      res.redirect('/admin?youtube_error=' + encodeURIComponent(error.message));
    }
  });

  // YouTube API routes
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

  app.post('/api/youtube/sync', isAuthenticated, async (req: any, res) => {
    try {
      const channelId = YOUTUBE_CONFIG.CHANNEL_ID;
      
      const youtubeVideos = await YouTubeService.listChannelVideosByChannelId(channelId);
      let syncedCount = 0;
      let skippedCount = 0;

      for (const ytVideo of youtubeVideos.items || []) {
        const videoId = ytVideo.id?.videoId || ytVideo.id;
        
        if (!videoId || typeof videoId !== 'string') {
          console.log('ID de vídeo inválido:', ytVideo.id);
          continue;
        }
        
        const existingVideos = await storage.getVideos({ search: videoId });
        
        if (existingVideos.length === 0) {
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
            status: "approved"
          });
          
          console.log(`Vídeo sincronizado: ${newVideo.title}`);
          syncedCount++;
        } else {
          console.log(`Vídeo já existe: ${videoId} - ${ytVideo.snippet?.title}`);
          skippedCount++;
        }
      }

      res.json({
        message: `${syncedCount} vídeos sincronizados, ${skippedCount} já existiam`,
        synced: syncedCount,
        skipped: skippedCount
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({ message: 'Erro na sincronização' });
    }
  });

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

  app.post('/api/youtube/playlists', isAuthenticated, async (req: any, res) => {
    try {
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

  app.post('/api/youtube/playlists/:playlistId/videos', isAuthenticated, async (req: any, res) => {
    try {
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

  app.post('/api/youtube/cleanup-invalid', isAuthenticated, async (req: any, res) => {
    try {
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

  // Upload de vídeo - USUÁRIOS NORMAIS (SEM OAUTH)
  app.post('/api/videos', upload.single('video'), async (req: any, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);

      if (req.file) {
        if (!YouTubeService.validateVideoFormat(req.file.path)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'Formato de vídeo não suportado' });
        }

        if (!YouTubeService.validateFileSize(req.file.path)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'Arquivo muito grande (máximo 2GB)' });
        }

        const permanentDir = 'uploads/pending';
        if (!fs.existsSync(permanentDir)) {
          fs.mkdirSync(permanentDir, { recursive: true });
        }
        
        const permanentPath = path.join(permanentDir, req.file.filename);
        fs.renameSync(req.file.path, permanentPath);
        
        console.log(`Arquivo salvo para processamento: ${permanentPath}`);
      }

      const finalVideoData = {
        ...videoData,
        youtubeId: null,
        youtubeUrl: null,
        status: 'pending' as const,
        filePath: req.file ? path.join('uploads/pending', req.file.filename) : null
      };

      const video = await storage.createVideo(finalVideoData);
      
      console.log(`Novo testemunho recebido (ID: ${video.id}): ${videoData.title}`);
      
      res.json({ 
        ...video,
        message: 'Testemunho enviado com sucesso! Será revisado e publicado em breve.'
      });

    } catch (error: any) {
      console.error("Error creating video:", error);
      
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Erro ao processar envio. Tente novamente." });
    }
  });

  app.delete('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
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
      const stats = await storage.getVideoStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      res.status(500).json({ message: "Failed to fetch overview statistics" });
    }
  });

  app.get('/api/admin/stats/location', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getVideosByLocation();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching location stats:", error);
      res.status(500).json({ message: "Failed to fetch location statistics" });
    }
  });

  app.get('/api/admin/stats/racism-type', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getVideosByRacismType();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching racism type stats:", error);
      res.status(500).json({ message: "Failed to fetch racism type statistics" });
    }
  });

  app.get('/api/admin/stats/age', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getVideosByAge();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching age stats:", error);
      res.status(500).json({ message: "Failed to fetch age statistics" });
    }
  });

  app.get('/api/admin/stats/gender', isAuthenticated, async (req: any, res) => {
    try {
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

  // ADMIN: Upload vídeo aprovado para YouTube
  app.post('/api/admin/videos/:id/upload-youtube', isAuthenticated, async (req: any, res) => {
    try {
      const tokens = req.session.youtubeTokens;
      if (!tokens) {
        return res.status(400).json({ 
          message: 'Autorização do YouTube necessária para admin',
          needsAuth: true 
        });
      }

      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Vídeo não encontrado" });
      }

      if (video.status !== 'approved') {
        return res.status(400).json({ message: "Apenas vídeos aprovados podem ser enviados ao YouTube" });
      }

      if (!video.filePath || !fs.existsSync(video.filePath)) {
        return res.status(400).json({ message: "Arquivo de vídeo não encontrado" });
      }

      console.log(`Iniciando upload para YouTube: ${video.title}`);

      const uploadResult = await YouTubeService.uploadVideo(
        tokens.access_token,
        video.filePath,
        video.title || 'Testemunho',
        `Testemunho sobre experiências de racismo. Localização: ${video.city}, ${video.state}. Tipo: ${video.racismType}`,
        ['testemunho', 'racismo', 'reparações históricas']
      );

      const updatedVideo = await storage.updateVideoWithYoutube(videoId, {
        youtubeId: uploadResult.videoId,
        youtubeUrl: uploadResult.url
      });

      fs.unlinkSync(video.filePath);

      res.json({
        message: 'Vídeo enviado ao YouTube com sucesso!',
        video: updatedVideo,
        youtubeUrl: uploadResult.url
      });

    } catch (error: any) {
      console.error('Erro no upload para YouTube:', error);
      res.status(500).json({ 
        message: 'Erro ao enviar vídeo para YouTube: ' + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}