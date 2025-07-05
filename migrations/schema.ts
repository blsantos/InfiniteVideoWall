import { pgTable, unique, varchar, boolean, timestamp, index, jsonb, serial, text, foreignKey, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	isAdmin: boolean("is_admin").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const chapters = pgTable("chapters", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	description: text(),
	qrCode: text("qr_code"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const videos = pgTable("videos", {
	id: serial().primaryKey().notNull(),
	youtubeId: varchar("youtube_id").notNull(),
	title: varchar(),
	duration: integer(),
	chapterId: integer("chapter_id"),
	ageRange: varchar("age_range").notNull(),
	gender: varchar().notNull(),
	city: varchar().notNull(),
	state: varchar().notNull(),
	country: varchar().default('Brasil').notNull(),
	skinTone: varchar("skin_tone").notNull(),
	racismType: varchar("racism_type").notNull(),
	racismTypeOther: text("racism_type_other"),
	authorName: varchar("author_name"),
	allowPublicDisplay: boolean("allow_public_display").default(false),
	allowFutureContact: boolean("allow_future_contact").default(false),
	status: varchar().default('pending').notNull(),
	rejectionReason: text("rejection_reason"),
	moderatedBy: varchar("moderated_by"),
	moderatedAt: timestamp("moderated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "videos_chapter_id_chapters_id_fk"
		}),
	foreignKey({
			columns: [table.moderatedBy],
			foreignColumns: [users.id],
			name: "videos_moderated_by_users_id_fk"
		}),
]);
