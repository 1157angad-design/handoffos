import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const requestSchema = z.object({
  page: z.string().max(180).default("/"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(3000),
      }),
    )
    .min(1)
    .max(16),
});

const productKnowledge = `You are the HandoffOS AI Architect, a precise product guide. HandoffOS preserves conversation context during bidirectional AI-to-human and human-to-AI handoffs. It transfers a structured context envelope containing transcript/history, customer intent, summary, relevant entities and state, sentiment/urgency, prior actions, and recommended next action so the recipient continues without asking the customer to repeat the issue.

The implemented product includes: workspace dashboard; interactive Integration Process (Choose Integration, Configure HandoffOS, Generate API Key, Install SDK, Test Handoff); projects; server-generated scoped API keys whose full secret is shown once and stored as a SHA-256 hash; SDK guidance for TypeScript, Python, Go and REST; analytics; searchable conversations and handoff IDs; team, billing, settings and support; webhooks; and integrations for Webhooks, Slack, Zendesk and Intercom. Authentication supports email/password and Google. Never claim other integrations, SDK capabilities, compliance certifications, SLAs or features exist. If asked about something not listed, say it is not currently shown as supported and direct the visitor to Support or Talk to an Architect for confirmation.

Pricing is exactly: Free Trial — 150 handoffs — ₹0; Standard — 2,500 — ₹1,999/month; Pro — 8,000 — ₹6,999/month; Advanced — 12,000 — ₹9,999/month; Business — 30,000 — ₹27,999/month; Enterprise — Unlimited — ₹69,999/month plus customisation.

Website: the landing page explains continuity and contains an interactive bidirectional demo. Features explains capabilities. Solutions explains use cases. Pricing lists all six tiers. Developers and Documentation provide quickstarts and API/SDK guidance. Contact reaches the team. Dashboard sections operate the workspace. Use the supplied current page to make guidance relevant. Be concise, helpful, and honest. Never expose or request secret API keys.`;

export const Route = createFileRoute("/api/architect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(
          await request.json().catch(() => null),
        );
        if (!parsed.success)
          return Response.json(
            { error: "Enter a valid question." },
            { status: 400 },
          );
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey)
          return Response.json(
            {
              error:
                "The Architect is being connected. Please try again shortly.",
            },
            { status: 503 },
          );
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
              temperature: 0.15,
              max_completion_tokens: 700,
              messages: [
                {
                  role: "system",
                  content: `${productKnowledge}\nCurrent page: ${parsed.data.page}`,
                },
                ...parsed.data.messages,
              ],
            }),
          },
        );
        if (!response.ok)
          return Response.json(
            { error: "The Architect is temporarily unavailable." },
            { status: 502 },
          );
        const result = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return Response.json({
          answer:
            result.choices?.[0]?.message?.content ||
            "I could not form a response. Please try another question.",
        });
      },
    },
  },
});
