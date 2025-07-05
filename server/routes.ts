import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, updateVideoStatusSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import multer from "multer";
import { google } from "googleapis";

const upload = multer({ storage: multer.memoryStorage() });

// YouTube API setup
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL
);

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
      const { chapterId, status, limit, offset } = req.query;
      const videos = await storage.getVideos({
        chapterId: chapterId ? parseInt(chapterId as string) : undefined,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
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

  app.post('/api/videos', upload.single('videoFile'), async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const videoFile = req.file;

      if (!videoFile) {
        return res.status(400).json({ message: "Video file is required" });
      }

      // Upload to YouTube (unlisted)
      const youtubeResponse = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: `Relato de racismo - ${videoData.city}, ${videoData.state}`,
            description: `Relato de experiência de racismo do tipo: ${videoData.racismType}`,
            tags: ['racismo', 'reparacoes-historicas', videoData.racismType],
          },
          status: {
            privacyStatus: 'unlisted',
          },
        },
        media: {
          body: videoFile.buffer,
        },
      });

      const youtubeId = youtubeResponse.data.id;
      if (!youtubeId) {
        throw new Error('Failed to upload to YouTube');
      }

      // Save video info to database
      const video = await storage.createVideo({
        ...videoData,
        youtubeId,
      });

      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.patch('/api/videos/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const update = updateVideoStatusSchema.parse(req.body);
      
      const video = await storage.updateVideoStatus(id, update, user.id);
      res.json(video);
    } catch (error) {
      console.error("Error updating video status:", error);
      res.status(500).json({ message: "Failed to update video status" });
    }
  });

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
