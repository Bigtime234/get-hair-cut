import { pgTable, text, timestamp, integer, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

// Users table (extends NextAuth schema)
export const users = pgTable('users', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('user'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// NextAuth required tables - ADD PRIMARY KEY TO ACCOUNTS
export const accounts = pgTable('accounts', {
  id: text('id').$defaultFn(() => createId()).primaryKey(), // ADDED: Primary key
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// ADD PRIMARY KEY TO VERIFICATION TOKENS
export const verificationTokens = pgTable('verificationTokens', {
  id: text('id').$defaultFn(() => createId()).primaryKey(), // ADDED: Primary key
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Services table - all services offered with ratings
export const services = pgTable('services', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  category: text('category'), // e.g., 'haircut', 'beard', 'styling'
  imageUrl: text('image_url'), // UploadThing file URL
  imageKey: text('image_key'), // UploadThing file key for deletion
  galleryUrls: text('gallery_urls'), // JSON array of UploadThing URLs
  galleryKeys: text('gallery_keys'), // JSON array of UploadThing keys
  // Rating fields for each service
  totalRatings: integer('total_ratings').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  fiveStars: integer('five_stars').default(0),
  fourStars: integer('four_stars').default(0),
  threeStars: integer('three_stars').default(0),
  twoStars: integer('two_stars').default(0),
  oneStar: integer('one_star').default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Working Hours table - barber's schedule
export const workingHours = pgTable('working_hours', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
  startTime: text('start_time').notNull(), // e.g., '09:00'
  endTime: text('end_time').notNull(), // e.g., '17:00'
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Blocked Times - for days off, breaks, etc.
export const blockedTimes = pgTable('blocked_times', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  startTime: text('start_time'), // null for all day
  endTime: text('end_time'), // null for all day
  reason: text('reason'), // 'vacation', 'break', 'appointment'
  isAllDay: boolean('is_all_day').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Bookings table - Auth required
export const bookings = pgTable('bookings', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  customerId: text('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serviceId: text('service_id').notNull().references(() => services.id),
  appointmentDate: timestamp('appointment_date').notNull(),
  startTime: text('start_time').notNull(), // e.g., '10:00'
  endTime: text('end_time').notNull(), // e.g., '10:30'
  status: bookingStatusEnum('status').notNull().default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'), // customer notes
  cancelReason: text('cancel_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Ratings table - star-only system (no text reviews)
export const ratings = pgTable('ratings', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stars: integer('stars').notNull(), // 1-5 stars only
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'booking_confirmed', 'booking_reminder', etc.
  isRead: boolean('is_read').notNull().default(false),
  relatedId: text('related_id'), // booking_id, rating_id, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// FIXED Relations - with explicit field mappings
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  bookings: many(bookings),
  ratings: many(ratings),
  notifications: many(notifications),
}));

// ADDED: Missing accounts relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ADDED: Missing sessions relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  // No direct relations needed for single barber
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, { fields: [bookings.customerId], references: [users.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  rating: one(ratings, { fields: [bookings.id], references: [ratings.bookingId] }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  booking: one(bookings, { fields: [ratings.bookingId], references: [bookings.id] }),
  customer: one(users, { fields: [ratings.customerId], references: [users.id] }),
}));

// ADDED: Missing notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));