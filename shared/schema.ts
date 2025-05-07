import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarId: integer("avatar_id").default(0),  // Per la compatibilità con l'avatar pixel
  profileImage: text("profile_image"),        // URL dell'immagine profilo
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Dreams
export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull().default("en"),
  visibility: text("visibility").notNull().default("public"),
  imageUrl: text("image_url"),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDreamSchema = createInsertSchema(dreams).pick({
  title: true,
  content: true,
  language: true,
  visibility: true,
  imageUrl: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect & {
  tags?: string[];
  author?: {
    id: number;
    username: string;
    profileImage?: string | null;
  };
  isLikedByUser?: boolean;
  likeCount?: number;
  commentCount?: number;
  matchPercentage?: number;
};

// Dream Tags
export const dreamTags = pgTable("dream_tags", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").notNull().references(() => dreams.id),
  tag: text("tag").notNull(),
});

export type DreamTag = typeof dreamTags.$inferSelect;

// Dream Likes
export const dreamLikes = pgTable("dream_likes", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").notNull().references(() => dreams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DreamLike = typeof dreamLikes.$inferSelect;

// Dream Comments
export const dreamComments = pgTable("dream_comments", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").notNull().references(() => dreams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDreamCommentSchema = createInsertSchema(dreamComments).pick({
  content: true,
});

export type InsertDreamComment = z.infer<typeof insertDreamCommentSchema>;
export type DreamComment = typeof dreamComments.$inferSelect;

// Dream Matches
export const dreamMatches = pgTable("dream_matches", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").notNull().references(() => dreams.id),
  matchedDreamId: integer("matched_dream_id").notNull().references(() => dreams.id),
  score: integer("score").notNull(), // Match percentage
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DreamMatch = typeof dreamMatches.$inferSelect;

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => dreamMatches.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  dreams: many(dreams),
  likes: many(dreamLikes),
  comments: many(dreamComments),
}));

export const dreamsRelations = relations(dreams, ({ one, many }) => ({
  author: one(users, {
    fields: [dreams.authorId],
    references: [users.id],
  }),
  tags: many(dreamTags),
  likes: many(dreamLikes),
  comments: many(dreamComments),
}));

export const dreamLikesRelations = relations(dreamLikes, ({ one }) => ({
  dream: one(dreams, {
    fields: [dreamLikes.dreamId],
    references: [dreams.id],
  }),
  user: one(users, {
    fields: [dreamLikes.userId],
    references: [users.id],
  }),
}));

export const dreamCommentsRelations = relations(dreamComments, ({ one }) => ({
  dream: one(dreams, {
    fields: [dreamComments.dreamId],
    references: [dreams.id],
  }),
  user: one(users, {
    fields: [dreamComments.userId],
    references: [users.id],
  }),
}));

export const dreamMatchesRelations = relations(dreamMatches, ({ one, many }) => ({
  dream: one(dreams, {
    fields: [dreamMatches.dreamId],
    references: [dreams.id],
  }),
  matchedDream: one(dreams, {
    fields: [dreamMatches.matchedDreamId],
    references: [dreams.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  match: one(dreamMatches, {
    fields: [chatMessages.matchId],
    references: [dreamMatches.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // like, comment, message
  userId: integer("user_id").notNull().references(() => users.id), // chi riceve la notifica
  actorId: integer("actor_id").notNull().references(() => users.id), // chi ha generato l'azione
  dreamId: integer("dream_id").references(() => dreams.id),
  commentId: integer("comment_id").references(() => dreamComments.id),
  chatId: integer("chat_id").references(() => dreamMatches.id),
  content: text("content"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  userId: true,
  actorId: true,
  dreamId: true,
  commentId: true,
  chatId: true,
  content: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  dream: one(dreams, {
    fields: [notifications.dreamId],
    references: [dreams.id],
  }),
  comment: one(dreamComments, {
    fields: [notifications.commentId],
    references: [dreamComments.id],
  }),
  chat: one(dreamMatches, {
    fields: [notifications.chatId],
    references: [dreamMatches.id],
  }),
}));
