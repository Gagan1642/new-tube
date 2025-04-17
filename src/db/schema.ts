import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerkId").unique().notNull(),
  name: text("name").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));


export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => [uniqueIndex("name_idx").on(t.name)]);

export const categoryRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));



export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})


export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));