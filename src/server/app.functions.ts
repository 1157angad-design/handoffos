import { createHash, randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getUser } from "@netlify/identity";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  analyticsEvents,
  apiKeys,
  auditLogs,
  conversations,
  handoffs,
  integrations,
  organizationMembers,
  organizations,
  plans,
  projects,
  subscriptions,
  supportTickets,
  usageRecords,
  users,
} from "../../db/schema";

const planCatalog = [
  {
    id: "free-trial",
    name: "Free Trial",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    handoffLimit: 150,
    projectLimit: 1,
    seatLimit: 2,
    features: [
      "Bidirectional handoffs",
      "Context preservation",
      "SDK and API access",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    monthlyPriceCents: 199900,
    annualPriceCents: 2398800,
    handoffLimit: 2500,
    projectLimit: 5,
    seatLimit: 5,
    features: [
      "Bidirectional handoffs",
      "Context preservation",
      "SDK and API access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPriceCents: 699900,
    annualPriceCents: 8398800,
    handoffLimit: 8000,
    projectLimit: 15,
    seatLimit: 15,
    features: ["Bidirectional handoffs", "Analytics", "Priority support"],
  },
  {
    id: "advanced",
    name: "Advanced",
    monthlyPriceCents: 999900,
    annualPriceCents: 11998800,
    handoffLimit: 12000,
    projectLimit: 30,
    seatLimit: 30,
    features: ["Bidirectional handoffs", "Analytics", "Audit logs"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPriceCents: 2799900,
    annualPriceCents: 33598800,
    handoffLimit: 30000,
    projectLimit: 75,
    seatLimit: 75,
    features: ["Bidirectional handoffs", "Analytics", "Audit logs"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPriceCents: 6999900,
    annualPriceCents: 83998800,
    handoffLimit: 2147483647,
    projectLimit: 1000,
    seatLimit: 1000,
    features: ["Unlimited handoffs", "Customisation", "Dedicated architecture"],
  },
];

async function requireWorkspace() {
  const identity = await getUser();
  if (!identity?.id || !identity.email)
    throw new Error("Authentication required");

  let [profile] = await db
    .select()
    .from(users)
    .where(eq(users.identityId, identity.id))
    .limit(1);
  if (!profile) {
    const [emailProfile] = await db
      .select()
      .from(users)
      .where(eq(users.email, identity.email))
      .limit(1);
    if (emailProfile) {
      const [linked] = await db
        .update(users)
        .set({
          identityId: identity.id,
          fullName: identity.name ?? emailProfile.fullName,
          avatarUrl: identity.pictureUrl ?? emailProfile.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, emailProfile.id))
        .returning();
      profile = linked;
    } else {
      const [created] = await db
        .insert(users)
        .values({
          identityId: identity.id,
          email: identity.email,
          fullName: identity.name ?? identity.email.split("@")[0],
          avatarUrl: identity.pictureUrl,
        })
        .returning();
      profile = created;
    }
  } else {
    const [updated] = await db
      .update(users)
      .set({
        email: identity.email,
        fullName: identity.name ?? profile.fullName,
        avatarUrl: identity.pictureUrl ?? profile.avatarUrl,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, profile.id))
      .returning();
    profile = updated;
  }

  let [membership] = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, profile.id))
    .limit(1);
  if (!membership) {
    const baseName = identity.name
      ? `${identity.name}'s Workspace`
      : "My Workspace";
    const slug = `${baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${randomBytes(3).toString("hex")}`;
    const [organization] = await db
      .insert(organizations)
      .values({ name: baseName, slug })
      .returning();
    const [createdMembership] = await db
      .insert(organizationMembers)
      .values({
        organizationId: organization.id,
        userId: profile.id,
        role: "owner",
      })
      .returning();
    membership = createdMembership;
    for (const plan of planCatalog)
      await db.insert(plans).values(plan).onConflictDoNothing();
    await db
      .insert(subscriptions)
      .values({
        organizationId: organization.id,
        planId: "free-trial",
        status: "trialing",
      });
    await db
      .insert(auditLogs)
      .values({
        organizationId: organization.id,
        actorId: profile.id,
        action: "organization.created",
        targetType: "organization",
        targetId: organization.id,
      });
  }

  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, membership.organizationId))
    .limit(1);
  return { identity, profile, membership, organization };
}

export const getWorkspaceData = createServerFn({ method: "GET" }).handler(
  async () => {
    const workspace = await requireWorkspace();
    const projectRows = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, workspace.organization.id))
      .orderBy(desc(projects.createdAt));
    const projectIds = projectRows.map((project) => project.id);
    const conversationRows = projectIds.length
      ? await db
          .select()
          .from(conversations)
          .where(inArray(conversations.projectId, projectIds))
          .orderBy(desc(conversations.updatedAt))
          .limit(50)
      : [];
    const conversationIds = conversationRows.map(
      (conversation) => conversation.id,
    );
    const handoffRows = conversationIds.length
      ? await db
          .select()
          .from(handoffs)
          .where(inArray(handoffs.conversationId, conversationIds))
          .orderBy(desc(handoffs.createdAt))
          .limit(100)
      : [];
    const keyRows = projectIds.length
      ? await db
          .select({
            id: apiKeys.id,
            projectId: apiKeys.projectId,
            name: apiKeys.name,
            type: apiKeys.type,
            prefix: apiKeys.prefix,
            lastUsedAt: apiKeys.lastUsedAt,
            revokedAt: apiKeys.revokedAt,
            createdAt: apiKeys.createdAt,
          })
          .from(apiKeys)
          .where(inArray(apiKeys.projectId, projectIds))
          .orderBy(desc(apiKeys.createdAt))
      : [];
    const integrationRows = await db
      .select()
      .from(integrations)
      .where(eq(integrations.organizationId, workspace.organization.id))
      .orderBy(desc(integrations.updatedAt));
    const memberRows = await db
      .select({
        id: organizationMembers.id,
        role: organizationMembers.role,
        createdAt: organizationMembers.createdAt,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, workspace.organization.id));
    const usageRows = await db
      .select()
      .from(usageRecords)
      .where(eq(usageRecords.organizationId, workspace.organization.id))
      .orderBy(desc(usageRecords.periodStart))
      .limit(12);
    const eventRows = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.organizationId, workspace.organization.id))
      .orderBy(desc(analyticsEvents.occurredAt))
      .limit(30);
    const auditRows = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, workspace.organization.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20);
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, workspace.organization.id))
      .limit(1);
    const [currentPlan] = subscription
      ? await db
          .select()
          .from(plans)
          .where(eq(plans.id, subscription.planId))
          .limit(1)
      : [];

    const completed = handoffRows.filter(
      (item) => item.status === "completed",
    ).length;
    return {
      profile: workspace.profile,
      organization: workspace.organization,
      role: workspace.membership.role,
      projects: projectRows,
      apiKeys: keyRows,
      conversations: conversationRows,
      handoffs: handoffRows,
      integrations: integrationRows,
      members: memberRows,
      usage: usageRows,
      events: eventRows,
      auditLogs: auditRows,
      subscription,
      plan: currentPlan,
      metrics: {
        total: handoffRows.length,
        aiToHuman: handoffRows.filter(
          (item) => item.direction === "ai_to_human",
        ).length,
        humanToAi: handoffRows.filter(
          (item) => item.direction === "human_to_ai",
        ).length,
        successRate: handoffRows.length
          ? Math.round((completed / handoffRows.length) * 1000) / 10
          : 0,
      },
    };
  },
);

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2).max(80),
      description: z.string().max(240).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const workspace = await requireWorkspace();
    const slugBase = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${randomBytes(2).toString("hex")}`;
    const [project] = await db
      .insert(projects)
      .values({
        organizationId: workspace.organization.id,
        name: data.name,
        slug,
        description: data.description,
      })
      .returning();
    await db
      .insert(auditLogs)
      .values({
        organizationId: workspace.organization.id,
        actorId: workspace.profile.id,
        action: "project.created",
        targetType: "project",
        targetId: project.id,
      });
    return project;
  });

export const generateApiKey = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string().uuid(),
      name: z.string().min(2).max(80),
      type: z.enum(["publishable", "secret", "webhook"]).default("secret"),
    }),
  )
  .handler(async ({ data }) => {
    const workspace = await requireWorkspace();
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, data.projectId),
          eq(projects.organizationId, workspace.organization.id),
        ),
      )
      .limit(1);
    if (!project) throw new Error("Project not found");
    const prefix =
      data.type === "publishable"
        ? "ho_pk"
        : data.type === "webhook"
          ? "ho_wh"
          : "ho_sk";
    const secret = `${prefix}_${randomBytes(24).toString("base64url")}`;
    await db
      .insert(apiKeys)
      .values({
        projectId: project.id,
        name: data.name,
        type: data.type,
        prefix: secret.slice(0, 12),
        keyHash: createHash("sha256").update(secret).digest("hex"),
        createdBy: workspace.profile.id,
      });
    await db
      .insert(auditLogs)
      .values({
        organizationId: workspace.organization.id,
        actorId: workspace.profile.id,
        action: "api_key.created",
        targetType: "project",
        targetId: project.id,
      });
    return { secret };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const workspace = await requireWorkspace();
    const projectIds = (
      await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.organizationId, workspace.organization.id))
    ).map((row) => row.id);
    if (!projectIds.length) throw new Error("API key not found");
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(
        and(eq(apiKeys.id, data.id), inArray(apiKeys.projectId, projectIds)),
      )
      .limit(1);
    if (!key) throw new Error("API key not found");
    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, key.id));
    return { ok: true };
  });

export const toggleIntegration = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ provider: z.string().min(2), name: z.string().min(2) }),
  )
  .handler(async ({ data }) => {
    const workspace = await requireWorkspace();
    const [existing] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.organizationId, workspace.organization.id),
          eq(integrations.provider, data.provider),
        ),
      )
      .limit(1);
    if (existing) {
      const [updated] = await db
        .update(integrations)
        .set({
          status:
            existing.status === "connected" ? "disconnected" : "connected",
          connectedBy: workspace.profile.id,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(integrations)
      .values({
        organizationId: workspace.organization.id,
        provider: data.provider,
        name: data.name,
        status: "connected",
        connectedBy: workspace.profile.id,
      })
      .returning();
    return created;
  });

export const createSupportTicket = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      subject: z.string().min(4).max(120),
      description: z.string().min(10).max(4000),
      priority: z.enum(["low", "normal", "high", "urgent"]),
    }),
  )
  .handler(async ({ data }) => {
    const workspace = await requireWorkspace();
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        organizationId: workspace.organization.id,
        openedBy: workspace.profile.id,
        ...data,
      })
      .returning();
    return ticket;
  });
