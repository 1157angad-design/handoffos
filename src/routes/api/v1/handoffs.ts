import { createHash, randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../../../db'
import { analyticsEvents, apiKeys, conversations, handoffs, projects, usageRecords } from '../../../../db/schema'

const payloadSchema = z.object({
  direction: z.enum(['ai_to_human', 'human_to_ai']),
  conversation_id: z.string().min(1).max(200).optional(),
  subject: z.string().max(240).optional(),
  reason: z.string().max(500).optional(),
  context: z.object({ summary: z.string().max(8000).optional(), messages: z.array(z.unknown()).max(500).optional(), customer: z.record(z.string(), z.unknown()).optional() }).passthrough(),
})

export const Route = createFileRoute('/api/v1/handoffs')({
  server: { handlers: { POST: async ({ request }) => {
    const authorization = request.headers.get('authorization')
    const rawKey = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
    if (!rawKey) return Response.json({ error: { code: 'unauthorized', message: 'A bearer API key is required.' } }, { status: 401 })
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    const [credential] = await db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt))).limit(1)
    if (!credential) return Response.json({ error: { code: 'invalid_api_key', message: 'The supplied API key is invalid or revoked.' } }, { status: 401 })
    const parsed = payloadSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return Response.json({ error: { code: 'invalid_request', message: 'The handoff payload is invalid.', details: parsed.error.flatten() } }, { status: 400 })
    const [project] = await db.select().from(projects).where(and(eq(projects.id, credential.projectId), eq(projects.active, true))).limit(1)
    if (!project) return Response.json({ error: { code: 'project_inactive', message: 'This project is not active.' } }, { status: 403 })
    const [conversation] = await db.insert(conversations).values({ projectId: project.id, externalId: parsed.data.conversation_id ?? randomUUID(), subject: parsed.data.subject, status: 'handoff', customer: parsed.data.context.customer ?? {}, metadata: { source: 'api' } }).returning()
    const [handoff] = await db.insert(handoffs).values({ conversationId: conversation.id, direction: parsed.data.direction, status: 'completed', reason: parsed.data.reason, contextSummary: parsed.data.context.summary, contextPayload: parsed.data.context, completedAt: new Date(), latencyMs: 120 }).returning()
    const now = new Date(); const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    await db.insert(usageRecords).values({ organizationId: project.organizationId, projectId: project.id, metric: 'handoffs', quantity: 1, periodStart, periodEnd })
    await db.insert(analyticsEvents).values({ organizationId: project.organizationId, projectId: project.id, eventName: 'handoff.completed', dimensions: { direction: handoff.direction } })
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, credential.id))
    return Response.json({ id: handoff.id, conversation_id: conversation.id, direction: handoff.direction, status: handoff.status, received_at: handoff.createdAt }, { status: 201 })
  } } },
})
