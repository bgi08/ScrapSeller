import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  userType: text("user_type").notNull().default("customer"), // customer, agent
  isActive: boolean("is_active").notNull().default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalPickups: integer("total_pickups").notNull().default(0),
});

export const materialCategories = pgTable("material_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ratePerKg: decimal("rate_per_kg", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const pickupOrders = pgTable("pickup_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  agentId: integer("agent_id"),
  status: text("status").notNull().default("pending"), // pending, assigned, in_progress, collecting, completed, cancelled
  pickupAddress: text("pickup_address").notNull(),
  estimatedWeight: decimal("estimated_weight", { precision: 8, scale: 2 }).notNull(),
  actualWeight: decimal("actual_weight", { precision: 8, scale: 2 }),
  estimatedEarning: decimal("estimated_earning", { precision: 10, scale: 2 }).notNull(),
  actualEarning: decimal("actual_earning", { precision: 10, scale: 2 }),
  materials: jsonb("materials").notNull(), // Array of {categoryId, weight, rate}
  preferredTime: text("preferred_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const agentLocations = pgTable("agent_locations", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  notes: text("notes"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPickups: true,
  rating: true,
});

export const insertMaterialCategorySchema = createInsertSchema(materialCategories).omit({
  id: true,
});

export const insertPickupOrderSchema = createInsertSchema(pickupOrders).omit({
  id: true,
  agentId: true,
  actualWeight: true,
  actualEarning: true,
  completedAt: true,
  createdAt: true,
});

export const insertAgentLocationSchema = createInsertSchema(agentLocations).omit({
  id: true,
  updatedAt: true,
});

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MaterialCategory = typeof materialCategories.$inferSelect;
export type InsertMaterialCategory = z.infer<typeof insertMaterialCategorySchema>;

export type PickupOrder = typeof pickupOrders.$inferSelect;
export type InsertPickupOrder = z.infer<typeof insertPickupOrderSchema>;

export type AgentLocation = typeof agentLocations.$inferSelect;
export type InsertAgentLocation = z.infer<typeof insertAgentLocationSchema>;

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
