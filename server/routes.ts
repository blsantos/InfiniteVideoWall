import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, updateVideoStatusSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import multer from "multer";
import YouTubeService from "./youtube";
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
  app.get('/api/youtube/auth', (req, res) => {
    const state = JSON.stringify({ userId: req.query.userId || null });
    const authUrl = YouTubeService.getAuthUrl(state);
    res.json({ authUrl });
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

  const httpServer = createServer(app);
  return httpServer;
}
