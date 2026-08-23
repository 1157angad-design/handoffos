import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { db } from '../../../db'
import { organizationMembers, users } from '../../../db/schema'

export const Route = createFileRoute('/api/billing')({
  server: { handlers: { POST: async ({ request }) => {
    const user = await getUser()
    if (!user?.email) return Response.json({ error: 'Authentication required.' }, { status: 401 })
    if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe is ready to connect. Add STRIPE_SECRET_KEY and plan price IDs in the Netlify environment.' }, { status: 503 })
    const body = await request.json() as { plan?: string }
    const planId = String(body.plan ?? '')
    const priceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}`]
    if (!priceId) return Response.json({ error: 'This plan does not have a configured Stripe price.' }, { status: 400 })
    const [profile] = await db.select().from(users).where(eq(users.identityId, user.id)).limit(1)
    if (!profile) return Response.json({ error: 'Complete workspace setup before changing plans.' }, { status: 409 })
    const [membership] = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, profile.id)).limit(1)
    if (!membership) return Response.json({ error: 'No workspace is associated with this account.' }, { status: 409 })
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = new URL(request.url).origin
    const session = await stripe.checkout.sessions.create({ mode: 'subscription', customer_email: user.email, line_items: [{ price: priceId, quantity: 1 }], metadata: { organizationId: membership.organizationId, planId }, subscription_data: { metadata: { organizationId: membership.organizationId, planId } }, success_url: `${origin}/dashboard/billing?checkout=success`, cancel_url: `${origin}/dashboard/billing?checkout=cancelled`, allow_promotion_codes: true })
    return Response.json({ url: session.url })
  } } },
})
