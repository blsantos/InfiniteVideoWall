import { relations } from "drizzle-orm/relations";
import { chapters, videos, users } from "./schema";

export const videosRelations = relations(videos, ({one}) => ({
	chapter: one(chapters, {
		fields: [videos.chapterId],
		references: [chapters.id]
	}),
	user: one(users, {
		fields: [videos.moderatedBy],
		references: [users.id]
	}),
}));

export const chaptersRelations = relations(chapters, ({many}) => ({
	videos: many(videos),
}));

export const usersRelations = relations(users, ({many}) => ({
	videos: many(videos),
}));