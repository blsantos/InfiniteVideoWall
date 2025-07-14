import {
  users,
  chapters,
  videos,
  type User,
  type UpsertUser,
  type Chapter,
  type Video,
  type InsertChapter,
  type InsertVideo,
  type UpdateVideoStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chapter operations
  getChapters(): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapterQRCode(id: number, qrCode: string): Promise<Chapter>;
  
  // Video operations
  getVideos(filters?: {
    chapterId?: number;
    status?: string;
    racismType?: string;
    location?: string;
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoStatus(id: number, update: UpdateVideoStatus, moderatorId: string): Promise<Video>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Statistics operations
  getVideoStats(): Promise<{
    totalVideos: number;
    pendingVideos: number;
    approvedVideos: number;
    rejectedVideos: number;
  }>;
  
  getVideosByLocation(): Promise<Array<{
    location: string;
    count: number;
  }> >;
  
  getVideosByRacismType(): Promise<Array<{
    racismType: string;
    count: number;
  }>>;
  
  getVideosByAge(): Promise<Array<{
    ageRange: string;
    count: number;
  }>>;
  
  getVideosByGender(): Promise<Array<{
    gender: string;
    count: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chapter operations
  async getChapters(): Promise<Chapter[]> {
    return await db.select().from(chapters).orderBy(asc(chapters.id));
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    return newChapter;
  }

  async updateChapterQRCode(id: number, qrCode: string): Promise<Chapter> {
    const [chapter] = await db
      .update(chapters)
      .set({ qrCode, updatedAt: new Date() })
      .where(eq(chapters.id, id))
      .returning();
    return chapter;
  }

  // Video operations
  async getVideos(filters?: {
    chapterId?: number;
    status?: string;
    racismType?: string;
    location?: string;
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Video[]> {
    let query = db.select().from(videos);
    
    const conditions = [];
    if (filters?.chapterId) {
      conditions.push(eq(videos.chapterId, filters.chapterId));
    }
    if (filters?.status) {
      conditions.push(eq(videos.status, filters.status));
    }
    if (filters?.racismType) {
      conditions.push(eq(videos.racismType, filters.racismType));
    }
    if (filters?.location) {
      conditions.push(or(
        sql`${videos.city} ILIKE ${`%${filters.location}%`}`,
        sql`${videos.state} ILIKE ${`%${filters.location}%`}`
      ));
    }
    if (filters?.search) {
      conditions.push(or(
        sql`${videos.title} ILIKE ${`%${filters.search}%`}`,
        sql`${videos.city} ILIKE ${`%${filters.search}%`}`,
        sql`${videos.racismType} ILIKE ${`%${filters.search}%`}`,
        sql`${videos.authorName} ILIKE ${`%${filters.search}%`}`
      ));
    }

    // Se há filtro por categoria, fazer join com chapters
    if (filters?.category) {
      query = db.select().from(videos)
        .innerJoin(chapters, eq(videos.chapterId, chapters.id))
        .where(eq(chapters.category, filters.category));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(desc(videos.createdAt)) as any;
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }
    
    return await query;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideoStatus(id: number, update: UpdateVideoStatus, moderatorId: string): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set({
        status: update.status,
        rejectionReason: update.rejectionReason,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Statistics operations
  async getVideoStats(): Promise<{
    totalVideos: number;
    pendingVideos: number;
    approvedVideos: number;
    rejectedVideos: number;
  }> {
    const [stats] = await db
      .select({
        totalVideos: count(),
        pendingVideos: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
        approvedVideos: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
        rejectedVideos: count(sql`CASE WHEN status = 'rejected' THEN 1 END`),
      })
      .from(videos);
    
    return {
      totalVideos: stats.totalVideos,
      pendingVideos: stats.pendingVideos,
      approvedVideos: stats.approvedVideos,
      rejectedVideos: stats.rejectedVideos,
    };
  }

  async getVideosByLocation(): Promise<Array<{ location: string; count: number }>> {
    const results = await db
      .select({
        location: sql`CONCAT(${videos.city}, ', ', ${videos.state})`.as('location'),
        count: count(),
      })
      .from(videos)
      .where(eq(videos.status, 'approved'))
      .groupBy(sql`CONCAT(${videos.city}, ', ', ${videos.state})`)
      .orderBy(desc(count()));
    
    return results.map(r => ({
      location: r.location as string,
      count: r.count,
    }));
  }

  async getVideosByRacismType(): Promise<Array<{ racismType: string; count: number }>> {
    const results = await db
      .select({
        racismType: videos.racismType,
        count: count(),
      })
      .from(videos)
      .where(eq(videos.status, 'approved'))
      .groupBy(videos.racismType)
      .orderBy(desc(count()));
    
    return results.map(r => ({
      racismType: r.racismType,
      count: r.count,
    }));
  }

  async getVideosByAge(): Promise<Array<{ ageRange: string; count: number }>> {
    const results = await db
      .select({
        ageRange: videos.ageRange,
        count: count(),
      })
      .from(videos)
      .where(eq(videos.status, 'approved'))
      .groupBy(videos.ageRange)
      .orderBy(desc(count()));
    
    return results.map(r => ({
      ageRange: r.ageRange,
      count: r.count,
    }));
  }

  async getVideosByGender(): Promise<Array<{ gender: string; count: number }>> {
    const results = await db
      .select({
        gender: videos.gender,
        count: count(),
      })
      .from(videos)
      .where(eq(videos.status, 'approved'))
      .groupBy(videos.gender)
      .orderBy(desc(count()));
    
    return results.map(r => ({
      gender: r.gender,
      count: r.count,
    }));
  }
}

export const storage = new DatabaseStorage();
