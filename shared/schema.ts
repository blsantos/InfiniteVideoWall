import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chapters table for book chapters
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  qrCode: text("qr_code"),
  youtubePlaylistId: varchar("youtube_playlist_id", { length: 100 }),
  youtubePlaylistUrl: text("youtube_playlist_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos table for storing video information
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  youtubeId: varchar("youtube_id"),
  youtubeUrl: varchar("youtube_url"),
  title: varchar("title"),
  duration: integer("duration"), // in seconds
  chapterId: integer("chapter_id").references(() => chapters.id),
  
  // Demographic data
  ageRange: varchar("age_range").notNull(),
  gender: varchar("gender").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  country: varchar("country").notNull().default("Brasil"),
  skinTone: varchar("skin_tone").notNull(),
  racismType: varchar("racism_type").notNull(),
  racismTypeOther: text("racism_type_other"),
  
  // Optional data
  authorName: varchar("author_name"),
  allowPublicDisplay: boolean("allow_public_display").default(false),
  allowFutureContact: boolean("allow_future_contact").default(false),
  
  // Moderation
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  
  // File handling for direct uploads
  filePath: varchar("file_path"), // Local file path for admin processing
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const chaptersRelations = relations(chapters, ({ many }) => ({
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  chapter: one(chapters, {
    fields: [videos.chapterId],
    references: [chapters.id],
  }),
  moderator: one(users, {
    fields: [videos.moderatedBy],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  moderatedVideos: many(videos),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  moderatedAt: true,
}).extend({
  videoFile: z.any().optional(), // For file upload
});

export const updateVideoStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type UpdateVideoStatus = z.infer<typeof updateVideoStatusSchema>;
