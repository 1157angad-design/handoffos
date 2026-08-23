import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { db } from '../../../../db'
import { subscriptions } from '../../../../db/schema'

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    const key = process.env.STRIPE_SECRET_KEY
    if (!secret || !key) return new Response('Stripe webhook is not configured.', { status: 503 })
    const signature = request.headers.get('stripe-signature')
    if (!signature) return new Response('Missing Stripe signature.', { status: 400 })
    try {
      const stripe = new Stripe(key)
      const event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const organizationId = session.metadata?.organizationId
        const planId = session.metadata?.planId
        if (organizationId && planId) {
          await db.update(subscriptions).set({ planId, stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id, stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id, status: 'active', updatedAt: new Date() }).where(eq(subscriptions.organizationId, organizationId))
        }
      }
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        await db.update(subscriptions).set({ status: 'canceled', cancelAtPeriodEnd: false, updatedAt: new Date() }).where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      }
      return Response.json({ received: true, type: event.type })
    } catch { return new Response('Invalid webhook signature.', { status: 400 }) }
  } } },
})
