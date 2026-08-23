import {
  bigint,
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const memberRole = pgEnum('member_role', ['owner', 'admin', 'developer', 'analyst', 'viewer'])
export const handoffDirection = pgEnum('handoff_direction', ['ai_to_human', 'human_to_ai'])
export const handoffStatus = pgEnum('handoff_status', ['queued', 'active', 'completed', 'failed'])
export const conversationStatus = pgEnum('conversation_status', ['open', 'handoff', 'resolved', 'archived'])
export const apiKeyType = pgEnum('api_key_type', ['publishable', 'secret', 'webhook'])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}

export const organizations = pgTable('organizations', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  logoUrl: text('logo_url'),
  settings: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
})

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  identityId: text('identity_id').notNull().unique(),
  email: text().notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
  ...timestamps,
})

export const organizationMembers = pgTable('organization_members', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: memberRole().default('owner').notNull(),
  invitedBy: uuid('invited_by').references(() => users.id),
  ...timestamps,
}, (table) => [uniqueIndex('member_org_user_idx').on(table.organizationId, table.userId)])

export const projects = pgTable('projects', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  slug: text().notNull(),
  description: text(),
  environment: text().default('production').notNull(),
  webhookUrl: text('webhook_url'),
  webhookSecretHash: text('webhook_secret_hash'),
  active: boolean().default(true).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('project_org_slug_idx').on(table.organizationId, table.slug)])

export const apiKeys = pgTable('api_keys', {
  id: uuid().defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  type: apiKeyType().default('secret').notNull(),
  prefix: text().notNull(),
  keyHash: text('key_hash').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const conversations = pgTable('conversations', {
  id: uuid().defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  externalId: text('external_id'),
  subject: text(),
  status: conversationStatus().default('open').notNull(),
  channel: text().default('api').notNull(),
  customer: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
})

export const messages = pgTable('messages', {
  id: uuid().defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderType: text('sender_type').notNull(),
  senderId: text('sender_id'),
  content: text().notNull(),
  metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const handoffs = pgTable('handoffs', {
  id: uuid().defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  direction: handoffDirection().notNull(),
  status: handoffStatus().default('queued').notNull(),
  reason: text(),
  contextSummary: text('context_summary'),
  contextPayload: jsonb('context_payload').$type<Record<string, unknown>>().default({}).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  latencyMs: integer('latency_ms'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
})

export const analyticsEvents = pgTable('analytics_events', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  eventName: text('event_name').notNull(),
  value: numeric({ precision: 14, scale: 4 }).default('1').notNull(),
  dimensions: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
})

export const integrations = pgTable('integrations', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  provider: text().notNull(),
  name: text().notNull(),
  status: text().default('disconnected').notNull(),
  config: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  connectedBy: uuid('connected_by').references(() => users.id),
  ...timestamps,
})

export const plans = pgTable('plans', {
  id: text().primaryKey(),
  name: text().notNull(),
  monthlyPriceCents: integer('monthly_price_cents').notNull(),
  annualPriceCents: integer('annual_price_cents').notNull(),
  handoffLimit: integer('handoff_limit').notNull(),
  projectLimit: integer('project_limit').notNull(),
  seatLimit: integer('seat_limit').notNull(),
  features: jsonb().$type<string[]>().default([]).notNull(),
  active: boolean().default(true).notNull(),
  ...timestamps,
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }).unique(),
  planId: text('plan_id').notNull().references(() => plans.id),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text().default('trialing').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  ...timestamps,
})

export const usageRecords = pgTable('usage_records', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  metric: text().notNull(),
  quantity: integer().default(0).notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  reportedToStripe: boolean('reported_to_stripe').default(false).notNull(),
  ...timestamps,
})

export const notifications = pgTable('notifications', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  body: text().notNull(),
  kind: text().default('info').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const auditLogs = pgTable('audit_logs', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => users.id),
  action: text().notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  ipAddress: text('ip_address'),
  metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const supportTickets = pgTable('support_tickets', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  openedBy: uuid('opened_by').notNull().references(() => users.id),
  subject: text().notNull(),
  description: text().notNull(),
  priority: text().default('normal').notNull(),
  status: text().default('open').notNull(),
  ...timestamps,
})
