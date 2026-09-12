import { useNavigate } from "@tanstack/react-router";
import { logout, updateUser } from "@netlify/identity";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  Clipboard,
  Code2,
  CreditCard,
  Download,
  ExternalLink,
  FileClock,
  FolderKanban,
  Github,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "./logo";
import { useAuth } from "@/lib/auth";
import {
  createProject,
  createSupportTicket,
  generateApiKey,
  getWorkspaceData,
  revokeApiKey,
  toggleIntegration,
} from "@/server/app.functions";
import { pricingPlans } from "@/lib/product";

type WorkspaceData = Awaited<ReturnType<typeof getWorkspaceData>>;

const nav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["integration-process", "Integration Process", FolderKanban],
  ["api-keys", "API Key", KeyRound],
  ["sdk-downloads", "SDK Download", ArrowDownToLine],
  ["analytics", "Analytics", BarChart3],
  ["conversations", "Conversations", MessageSquareText],
  ["team", "Team", Users],
  ["billing", "Billing", CreditCard],
  ["settings", "Settings", Settings],
  ["support", "Support", CircleHelp],
] as const;

export function DashboardApp({ section = "dashboard" }: { section?: string }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await getWorkspaceData());
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to load this workspace.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) void navigate({ to: "/login" });
    if (user) void refresh();
  }, [authLoading, user, navigate]);
  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    (
      window as typeof window & {
        __handoffSearch?: Array<{
          title: string;
          detail: string;
          href: string;
          terms: string;
        }>;
      }
    ).__handoffSearch = [
      ...data.conversations.map((conversation) => ({
        title:
          conversation.subject || conversation.externalId || "Conversation",
        detail: `Conversation · ${conversation.status}`,
        href: "/dashboard/conversations",
        terms: `${conversation.id} ${conversation.externalId || ""} ${conversation.channel}`,
      })),
      ...data.handoffs.map((handoff) => ({
        title: `Handoff ${handoff.id.slice(0, 8)}`,
        detail: `${handoff.direction.replaceAll("_", " → ")} · ${handoff.status}`,
        href: "/dashboard/conversations",
        terms: `${handoff.id} ${handoff.reason || ""} ${handoff.contextSummary || ""}`,
      })),
      ...data.integrations.map((integration) => ({
        title: integration.name,
        detail: `Integration · ${integration.status}`,
        href: "/dashboard/integration-process",
        terms: integration.provider,
      })),
    ];
  }, [data]);
  async function signOut() {
    await logout();
    await navigate({ to: "/" });
  }

  if (authLoading || (loading && !data)) return <DashboardLoading />;
  if (!user) return null;
  return (
    <div className="app-shell">
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <a
              key={id}
              href={id === "dashboard" ? "/dashboard" : `/dashboard/${id}`}
              className={section === id ? "active" : ""}
            >
              <Icon />
              {label}
              {id === "conversations" &&
                data &&
                data.conversations.length > 0 && (
                  <i>{data.conversations.length}</i>
                )}
            </a>
          ))}
        </nav>
        <div className="plan-card">
          <span>CURRENT PLAN</span>
          <strong>{data?.plan?.name ?? "Starter"}</strong>
          <div>
            <i
              style={{
                width: `${Math.min(100, ((data?.metrics.total ?? 0) / (data?.plan?.handoffLimit ?? 2500)) * 100)}%`,
              }}
            />
          </div>
          <p>
            {(data?.metrics.total ?? 0).toLocaleString()} /{" "}
            {(data?.plan?.handoffLimit ?? 2500).toLocaleString()} handoffs
          </p>
          <a href="/dashboard/billing">
            Upgrade plan <ArrowRight />
          </a>
        </div>
        <button className="sidebar-user" onClick={signOut}>
          <span>
            {(data?.profile.fullName ?? user.email ?? "U")
              .slice(0, 1)
              .toUpperCase()}
          </span>
          <div>
            <strong>
              {data?.profile.fullName ?? user.name ?? "Workspace user"}
            </strong>
            <small>{data?.profile.email ?? user.email}</small>
          </div>
          <LogOut />
        </button>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <div className="workspace-picker">
            <span>{data?.organization.name?.slice(0, 1)}</span>
            <div>
              <small>WORKSPACE</small>
              <strong>{data?.organization.name}</strong>
            </div>
            <ChevronDown />
          </div>
          <div className="global-search">
            <Search />
            <input placeholder="Search projects, conversations, keys…" />
            <kbd>⌘K</kbd>
          </div>
          <div className="header-actions">
            <button onClick={() => setNotificationsOpen((value) => !value)}>
              <Bell />
              {data && data.auditLogs.length > 0 && <i />}
            </button>
            <a href="/dashboard/support">
              <CircleHelp />
            </a>
            <button className="profile-chip">
              <span>{(data?.profile.fullName ?? "U").slice(0, 1)}</span>
              <ChevronDown />
            </button>
            {notificationsOpen && (
              <div className="notification-popover">
                <strong>Activity feed</strong>
                {data?.auditLogs.slice(0, 4).map((item) => (
                  <div key={item.id}>
                    <Activity />
                    <span>
                      <b>{humanize(item.action)}</b>
                      <small>{formatDate(item.createdAt)}</small>
                    </span>
                  </div>
                ))}
                {!data?.auditLogs.length && <p>No new notifications.</p>}
              </div>
            )}
          </div>
        </header>
        <main className="dashboard-content">
          {error && (
            <div className="page-error">
              <AlertTriangle />
              {error}
              <button onClick={refresh}>Retry</button>
            </div>
          )}
          {data && (
            <SectionRouter section={section} data={data} refresh={refresh} />
          )}
        </main>
      </div>
    </div>
  );
}

function SectionRouter({
  section,
  data,
  refresh,
}: {
  section: string;
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  switch (section) {
    case "projects":
      return <ProjectsPage data={data} refresh={refresh} />;
    case "api-keys":
      return <ApiKeysPage data={data} refresh={refresh} />;
    case "sdk-downloads":
      return <SdkPage data={data} />;
    case "analytics":
      return <AnalyticsPage data={data} />;
    case "conversations":
      return <ConversationsPage data={data} />;
    case "integration-process":
      return <IntegrationProcessPage data={data} refresh={refresh} />;
    case "team":
      return <TeamPage data={data} />;
    case "billing":
      return <BillingPage data={data} />;
    case "settings":
      return <SettingsPage data={data} refresh={refresh} />;
    case "support":
      return <SupportPage data={data} />;
    default:
      return <Overview data={data} />;
  }
}

function PageTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Overview({ data }: { data: WorkspaceData }) {
  const chart = buildChart(data.handoffs);
  const pie = [
    { name: "AI → Human", value: data.metrics.aiToHuman, color: "#2f7cff" },
    { name: "Human → AI", value: data.metrics.humanToAi, color: "#52e275" },
  ];
  return (
    <>
      <PageTitle
        eyebrow="COMMAND CENTER"
        title={`Welcome back, ${data.profile.fullName?.split(" ")[0] ?? "Builder"}.`}
        text="Monitor handoff health, usage, and live customer continuity across your workspace."
        action={
          <a href="/dashboard/projects" className="button button--primary">
            <Plus /> New project
          </a>
        }
      />
      <div className="metric-grid">
        <Metric
          icon={<RefreshCw />}
          label="Total handoffs"
          value={data.metrics.total.toLocaleString()}
          tone="blue"
        />
        <Metric
          icon={<Bot />}
          label="AI → Human"
          value={data.metrics.aiToHuman.toLocaleString()}
          tone="purple"
        />
        <Metric
          icon={<CircleUserRound />}
          label="Human → AI"
          value={data.metrics.humanToAi.toLocaleString()}
          tone="green"
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Success rate"
          value={`${data.metrics.successRate}%`}
          tone="orange"
        />
      </div>
      {data.projects.length === 0 ? (
        <Onboarding />
      ) : (
        <div className="dashboard-grid">
          <Panel title="Handoffs overview" className="chart-panel">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="handoffFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f7cff" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#2f7cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#142841" vertical={false} />
                <XAxis dataKey="date" stroke="#6d8199" fontSize={11} />
                <YAxis stroke="#6d8199" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#071321",
                    border: "1px solid #203752",
                    borderRadius: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="handoffs"
                  stroke="#2f7cff"
                  fill="url(#handoffFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Recent activity">
            <ActivityList data={data} />
          </Panel>
          <Panel title="Top projects">
            <ProjectBars data={data} />
          </Panel>
          <Panel title="Usage breakdown">
            <div className="pie-layout">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    innerRadius={53}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {pie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div>
                {pie.map((entry) => (
                  <p key={entry.name}>
                    <i style={{ background: entry.color }} />
                    <span>
                      {entry.name}
                      <small>{entry.value.toLocaleString()} handoffs</small>
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}
      <div className="help-banner">
        <Code2 />
        <div>
          <strong>Need help integrating?</strong>
          <span>
            Use the SDK quickstart or test a real API request in the playground.
          </span>
        </div>
        <a href="/documentation" className="button button--ghost">
          View documentation
        </a>
        <a href="/dashboard/sdk-downloads" className="button button--primary">
          Go to SDKs
        </a>
      </div>
    </>
  );
}

function Onboarding() {
  return (
    <div className="onboarding">
      <div>
        <span>DEVELOPER FLOW</span>
        <h2>Your first production handoff starts here.</h2>
        <p>
          Create a project, generate a scoped API key, install an SDK, and send
          a context envelope.
        </p>
      </div>
      <ol>
        <li className="active">
          <b>01</b>
          <span>
            <strong>Create project</strong>
            <small>Define your first environment</small>
          </span>
          <a href="/dashboard/projects">
            <ArrowRight />
          </a>
        </li>
        <li>
          <b>02</b>
          <span>
            <strong>Generate API key</strong>
            <small>Create a server credential</small>
          </span>
        </li>
        <li>
          <b>03</b>
          <span>
            <strong>Install SDK</strong>
            <small>TypeScript, Python, Go, or REST</small>
          </span>
        </li>
        <li>
          <b>04</b>
          <span>
            <strong>Send first handoff</strong>
            <small>Verify context delivery</small>
          </span>
        </li>
      </ol>
    </div>
  );
}

function ProjectsPage({
  data,
  refresh,
}: {
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await createProject({
        data: {
          name: String(form.get("name")),
          description: String(form.get("description")),
        },
      });
      setOpen(false);
      await refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to create the project.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="WORKSPACES"
        title="Projects"
        text="Isolate credentials, analytics, environments, and handoff policies by product or customer."
        action={
          <button
            className="button button--primary"
            onClick={() => setOpen(true)}
          >
            <Plus /> Create project
          </button>
        }
      />
      {data.projects.length ? (
        <div className="project-grid">
          {data.projects.map((project) => (
            <article key={project.id}>
              <div className="project-icon">
                {project.name.slice(0, 2).toUpperCase()}
              </div>
              <span
                className={
                  project.active
                    ? "status-pill status-pill--success"
                    : "status-pill"
                }
              >
                {project.active ? "ACTIVE" : "PAUSED"}
              </span>
              <h2>{project.name}</h2>
              <p>{project.description || "No description added yet."}</p>
              <div>
                <span>
                  <Radio />{" "}
                  {
                    data.handoffs.filter(
                      (handoff) =>
                        data.conversations.find(
                          (conversation) =>
                            conversation.id === handoff.conversationId,
                        )?.projectId === project.id,
                    ).length
                  }{" "}
                  handoffs
                </span>
                <span>
                  <KeyRound />{" "}
                  {
                    data.apiKeys.filter(
                      (key) => key.projectId === project.id && !key.revokedAt,
                    ).length
                  }{" "}
                  keys
                </span>
              </div>
              <footer>
                <code>{project.slug}</code>
                <button>
                  <MoreHorizontal />
                </button>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          icon={<FolderKanban />}
          title="No projects yet"
          text="Create your first project to isolate handoffs, credentials, and usage."
          action={
            <button
              className="button button--primary"
              onClick={() => setOpen(true)}
            >
              <Plus /> Create first project
            </button>
          }
        />
      )}
      {open && (
        <Modal title="Create project" close={() => setOpen(false)}>
          <form onSubmit={submit} className="modal-form">
            <label>
              Project name
              <input
                name="name"
                required
                minLength={2}
                placeholder="Acme Support"
                autoFocus
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={3}
                placeholder="Customer support escalation workflows"
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button className="button button--primary" disabled={busy}>
              {busy ? <LoaderCircle className="spin" /> : "Create project"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

function ApiKeysPage({
  data,
  refresh,
}: {
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await generateApiKey({
        data: {
          projectId: String(form.get("projectId")),
          name: String(form.get("name")),
          type: String(form.get("type")) as
            | "publishable"
            | "secret"
            | "webhook",
        },
      });
      setSecret(result.secret);
      await refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to generate the API key.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    if (
      !window.confirm(
        "Revoke this key? Applications using it stop working immediately.",
      )
    )
      return;
    await revokeApiKey({ data: { id } });
    await refresh();
  }
  return (
    <>
      <PageTitle
        eyebrow="CREDENTIALS"
        title="API Keys"
        text="Issue scoped credentials for server requests, client initialization, and webhook verification."
        action={
          <button
            className="button button--primary"
            disabled={!data.projects.length}
            onClick={() => setOpen(true)}
          >
            <Plus /> Generate key
          </button>
        }
      />
      <div className="security-note">
        <ShieldCheck />
        <span>
          <strong>Secrets are hashed at rest.</strong> Full secret keys are
          displayed only once, immediately after creation.
        </span>
      </div>
      {data.apiKeys.length ? (
        <div className="data-table">
          <div className="table-head">
            <span>Name</span>
            <span>Type</span>
            <span>Project</span>
            <span>Last used</span>
            <span>Status</span>
            <span />
          </div>
          {data.apiKeys.map((key) => (
            <div className="table-row" key={key.id}>
              <span>
                <KeyRound />
                <b>{key.name}</b>
                <code>{key.prefix}••••••••</code>
              </span>
              <span>{key.type}</span>
              <span>
                {
                  data.projects.find((project) => project.id === key.projectId)
                    ?.name
                }
              </span>
              <span>
                {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
              </span>
              <span
                className={
                  key.revokedAt ? "status-text danger" : "status-text success"
                }
              >
                {key.revokedAt ? "Revoked" : "Active"}
              </span>
              <button
                onClick={() => void revoke(key.id)}
                disabled={Boolean(key.revokedAt)}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={<KeyRound />}
          title="No API keys"
          text={
            data.projects.length
              ? "Generate a scoped key for your first integration."
              : "Create a project before generating credentials."
          }
          action={
            data.projects.length ? (
              <button
                className="button button--primary"
                onClick={() => setOpen(true)}
              >
                Generate key
              </button>
            ) : (
              <a href="/dashboard/projects" className="button button--primary">
                Create project
              </a>
            )
          }
        />
      )}
      {open && (
        <Modal
          title={secret ? "Save your secret key" : "Generate API key"}
          close={() => {
            setOpen(false);
            setSecret("");
          }}
        >
          {secret ? (
            <div className="secret-reveal">
              <AlertTriangle />
              <p>
                This key is shown once. Store it in a secure secret manager.
              </p>
              <code>{secret}</code>
              <button
                className="button button--primary"
                onClick={() => void navigator.clipboard.writeText(secret)}
              >
                <Clipboard /> Copy secret
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="modal-form">
              <label>
                Key name
                <input name="name" required placeholder="Production server" />
              </label>
              <label>
                Project
                <select name="projectId">
                  {data.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Credential type
                <select name="type">
                  <option value="secret">Secret key</option>
                  <option value="publishable">Publishable key</option>
                  <option value="webhook">Webhook key</option>
                </select>
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button className="button button--primary" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" />
                ) : (
                  "Generate secure key"
                )}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

function SdkPage({ data }: { data: WorkspaceData }) {
  const [tab, setTab] = useState("typescript");
  const [response, setResponse] = useState("");
  const snippets: Record<string, string> = {
    typescript: `npm install @handoffos/sdk`,
    python: `pip install handoffos`,
    go: `go get github.com/handoffos/handoffos-go`,
    curl: `curl -X POST https://your-site.netlify.app/api/v1/handoffs`,
  };
  return (
    <>
      <PageTitle
        eyebrow="DEVELOPER TOOLING"
        title="SDKs & API Playground"
        text="Install a typed client or verify your payload directly against the HandoffOS API."
      />
      <div className="sdk-grid">
        <Panel title="Official SDKs">
          <div className="sdk-list">
            {[
              ["typescript", "TypeScript / Node", "npm"],
              ["python", "Python", "PyPI"],
              ["go", "Go", "Go modules"],
              ["curl", "REST API", "OpenAPI"],
            ].map(([id, name, registry]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                <Code2 />
                <span>
                  <strong>{name}</strong>
                  <small>{registry} · Production ready</small>
                </span>
                <Download />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Installation">
          <div className="terminal">
            <div>
              <i />
              <i />
              <i />
              <span>{tab}</span>
            </div>
            <code>{snippets[tab]}</code>
            <button
              onClick={() => void navigator.clipboard.writeText(snippets[tab])}
            >
              <Clipboard /> Copy
            </button>
          </div>
          <h3>Initialize and send</h3>
          <pre className="sdk-code">{`const handoff = await client.handoffs.create({\n  direction: 'ai_to_human',\n  conversation_id: 'conv_98AB',\n  context: { summary, messages, customer }\n})`}</pre>
        </Panel>
      </div>
      <Panel title="API Playground" className="playground">
        <Playground data={data} response={response} setResponse={setResponse} />
      </Panel>
    </>
  );
}

function Playground({
  data,
  response,
  setResponse,
}: {
  data: WorkspaceData;
  response: string;
  setResponse: (value: string) => void;
}) {
  const [sending, setSending] = useState(false);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await fetch("/api/v1/handoffs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${String(form.get("apiKey"))}`,
        },
        body: JSON.stringify({
          direction: form.get("direction"),
          conversation_id: `playground_${Date.now()}`,
          subject: "API Playground handoff",
          reason: "Integration test",
          context: {
            summary: form.get("summary"),
            customer: { source: "playground" },
          },
        }),
      });
      setResponse(JSON.stringify(await result.json(), null, 2));
    } catch {
      setResponse(
        JSON.stringify(
          { error: "Request failed before reaching the API." },
          null,
          2,
        ),
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="playground-grid">
      <form onSubmit={send}>
        <label>
          Secret API key
          <input name="apiKey" type="password" required placeholder="ho_sk_…" />
        </label>
        <label>
          Direction
          <select name="direction">
            <option value="ai_to_human">AI → Human</option>
            <option value="human_to_ai">Human → AI</option>
          </select>
        </label>
        <label>
          Context summary
          <textarea
            name="summary"
            required
            rows={5}
            defaultValue="Customer needs an export specialist. Previous troubleshooting and account context are attached."
          />
        </label>
        <button
          className="button button--primary"
          disabled={sending || !data.projects.length}
        >
          {sending ? (
            <LoaderCircle className="spin" />
          ) : (
            <>
              <Send /> Send handoff
            </>
          )}
        </button>
        {!data.projects.length && (
          <small>Create a project and API key first.</small>
        )}
      </form>
      <pre>{response || "// API response appears here"}</pre>
    </div>
  );
}

function AnalyticsPage({ data }: { data: WorkspaceData }) {
  const chart = buildChart(data.handoffs);
  const latency = data.handoffs.length
    ? Math.round(
        data.handoffs.reduce(
          (sum, handoff) => sum + (handoff.latencyMs ?? 0),
          0,
        ) / data.handoffs.length,
      )
    : 0;
  return (
    <>
      <PageTitle
        eyebrow="OBSERVABILITY"
        title="Analytics"
        text="Track transfer volume, direction, success, and delivery performance from real handoff events."
      />
      <div className="metric-grid">
        <Metric
          icon={<Activity />}
          label="Handoff volume"
          value={data.metrics.total.toLocaleString()}
          tone="blue"
        />
        <Metric
          icon={<Zap />}
          label="Avg. latency"
          value={`${latency}ms`}
          tone="green"
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Completion rate"
          value={`${data.metrics.successRate}%`}
          tone="purple"
        />
        <Metric
          icon={<FolderKanban />}
          label="Active projects"
          value={String(
            data.projects.filter((project) => project.active).length,
          )}
          tone="orange"
        />
      </div>
      <Panel title="30-day handoff volume" className="chart-panel large">
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={chart}>
            <CartesianGrid stroke="#142841" vertical={false} />
            <XAxis dataKey="date" stroke="#6d8199" />
            <YAxis stroke="#6d8199" />
            <Tooltip
              contentStyle={{
                background: "#071321",
                border: "1px solid #203752",
              }}
            />
            <Area
              dataKey="handoffs"
              stroke="#2f7cff"
              fill="#112d59"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
      {!data.handoffs.length && (
        <div className="inline-empty">
          <BarChart3 />
          <span>
            <strong>Analytics populate from live events.</strong> Send a handoff
            from the API Playground to create the first data point.
          </span>
        </div>
      )}
    </>
  );
}

function ConversationsPage({ data }: { data: WorkspaceData }) {
  const [selected, setSelected] = useState(data.conversations[0]?.id ?? "");
  const conversation = data.conversations.find((item) => item.id === selected);
  const handoff = data.handoffs.find(
    (item) => item.conversationId === selected,
  );
  return (
    <>
      <PageTitle
        eyebrow="CONVERSATION LOG"
        title="Conversations"
        text="Inspect live transfer state and the exact context preserved for each customer journey."
      />
      {data.conversations.length ? (
        <div className="conversation-layout">
          <div className="conversation-list">
            <div className="list-search">
              <Search />
              <input placeholder="Search conversations" />
            </div>
            {data.conversations.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={selected === item.id ? "active" : ""}
              >
                <span>
                  <Bot />
                </span>
                <div>
                  <strong>
                    {item.subject || item.externalId || "Untitled conversation"}
                  </strong>
                  <small>
                    {item.channel} · {formatDate(item.updatedAt)}
                  </small>
                </div>
                <i className={`conversation-status ${item.status}`} />
              </button>
            ))}
          </div>
          <div className="context-inspector">
            <header>
              <div>
                <span>HANDOFF CONTEXT PREVIEW</span>
                <h2>{conversation?.subject || conversation?.externalId}</h2>
              </div>
              <span className="status-pill status-pill--success">
                {handoff?.status ?? conversation?.status}
              </span>
            </header>
            {handoff ? (
              <>
                <div className="inspector-summary">
                  <Sparkles />
                  <span>
                    <small>CONTEXT SUMMARY</small>
                    <p>
                      {handoff.contextSummary ||
                        "No summary supplied with this handoff."}
                    </p>
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Direction</dt>
                    <dd>
                      {handoff.direction === "ai_to_human"
                        ? "AI → Human"
                        : "Human → AI"}
                    </dd>
                  </div>
                  <div>
                    <dt>Reason</dt>
                    <dd>{handoff.reason || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt>Latency</dt>
                    <dd>{handoff.latencyMs ?? 0}ms</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(handoff.createdAt)}</dd>
                  </div>
                </dl>
                <pre>{JSON.stringify(handoff.contextPayload, null, 2)}</pre>
              </>
            ) : (
              <Empty
                icon={<MessageSquareText />}
                title="No handoff attached"
                text="This conversation has not entered a handoff flow."
              />
            )}
          </div>
        </div>
      ) : (
        <Empty
          icon={<MessageSquareText />}
          title="No conversations yet"
          text="Conversations appear when your integration sends its first handoff."
          action={
            <a
              href="/dashboard/sdk-downloads"
              className="button button--primary"
            >
              Open API Playground
            </a>
          }
        />
      )}
    </>
  );
}

const integrationCatalog = [
  ["slack", "Slack", "Notify teams and coordinate human ownership."],
  [
    "salesforce",
    "Salesforce",
    "Attach CRM accounts, cases, and contact context.",
  ],
  ["zendesk", "Zendesk", "Create tickets with full handoff context."],
  ["hubspot", "HubSpot", "Sync customer records and conversation outcomes."],
  ["segment", "Segment", "Stream lifecycle analytics to your data stack."],
  ["webhook", "Custom Webhook", "Deliver signed events to any HTTPS endpoint."],
];
function IntegrationProcessPage({
  data,
  refresh,
}: {
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const steps = [
    ["Choose Integration", "Select a supported connection below."],
    ["Configure HandoffOS", "Set direction, routing, and context fields."],
    ["Generate API Key", "Create a scoped credential for this project."],
    ["Install SDK", "Add TypeScript, Python, Go, or REST."],
    ["Test Handoff", "Send a sandbox transfer and inspect continuity."],
  ];
  return (
    <>
      <PageTitle
        eyebrow="GUIDED SETUP"
        title="Integration Process"
        text="Complete each live setup stage and move from connection choice to verified handoff."
      />
      <div className="integration-process">
        <nav>
          {steps.map(([title], index) => (
            <button
              key={title}
              className={step === index ? "active" : step > index ? "done" : ""}
              onClick={() => setStep(index)}
            >
              <i>{step > index ? "✓" : index + 1}</i>
              <span>{title}</span>
            </button>
          ))}
        </nav>
        <section>
          <span>STEP {step + 1} OF 5</span>
          <h2>{steps[step][0]}</h2>
          <p>{steps[step][1]}</p>
          {step === 0 && (
            <small>
              Connect Webhooks, Slack, Zendesk, or Intercom using the cards
              below.
            </small>
          )}
          {step === 1 && (
            <div className="setup-options">
              <label>
                Direction
                <select>
                  <option>AI → Human</option>
                  <option>Human → AI</option>
                </select>
              </label>
              <label>
                Context mode
                <select>
                  <option>Summary + full conversation</option>
                  <option>Summary only</option>
                </select>
              </label>
            </div>
          )}
          {step === 2 && (
            <a href="/dashboard/api-keys" className="button button--secondary">
              <KeyRound /> Open API Key
            </a>
          )}
          {step === 3 && (
            <a
              href="/dashboard/sdk-downloads"
              className="button button--secondary"
            >
              <Download /> Open SDK Download
            </a>
          )}
          {step === 4 && (
            <a href="/#demo" className="button button--secondary">
              <Zap /> Open live handoff test
            </a>
          )}
          <button
            className="button button--primary"
            disabled={step === 4}
            onClick={() => setStep((value) => Math.min(4, value + 1))}
          >
            {step === 4 ? "Setup complete" : "Save and continue"} <ArrowRight />
          </button>
        </section>
      </div>
      <IntegrationsPage data={data} refresh={refresh} />
    </>
  );
}

function IntegrationsPage({
  data,
  refresh,
}: {
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState("");
  async function toggle(provider: string, name: string) {
    setBusy(provider);
    await toggleIntegration({ data: { provider, name } });
    await refresh();
    setBusy("");
  }
  return (
    <>
      <div className="integration-grid">
        {integrationCatalog.map(([provider, name, description]) => {
          const connected =
            data.integrations.find((item) => item.provider === provider)
              ?.status === "connected";
          return (
            <article key={provider}>
              <div className={`integration-logo ${provider}`}>
                {provider === "webhook" ? <Webhook /> : name.slice(0, 1)}
              </div>
              <span
                className={
                  connected ? "status-pill status-pill--success" : "status-pill"
                }
              >
                {connected ? "CONNECTED" : "AVAILABLE"}
              </span>
              <h2>{name}</h2>
              <p>{description}</p>
              <button
                className={
                  connected
                    ? "button button--ghost"
                    : "button button--secondary"
                }
                onClick={() => void toggle(provider, name)}
                disabled={busy === provider}
              >
                {busy === provider ? (
                  <LoaderCircle className="spin" />
                ) : connected ? (
                  "Disconnect"
                ) : (
                  "Connect"
                )}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

function TeamPage({ data }: { data: WorkspaceData }) {
  return (
    <>
      <PageTitle
        eyebrow="ACCESS CONTROL"
        title="Team"
        text="Manage workspace membership and role-based access to production conversation data."
        action={
          <a
            className="button button--primary"
            href="mailto:?subject=Join my HandoffOS workspace"
          >
            <Plus /> Invite teammate
          </a>
        }
      />
      <div className="security-note">
        <LockKeyhole />
        <span>
          <strong>Least-privilege roles.</strong> Owners manage billing and
          security; developers manage integrations; analysts have read-only
          analytics access.
        </span>
      </div>
      <div className="data-table team-table">
        <div className="table-head">
          <span>Member</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Status</span>
          <span />
        </div>
        {data.members.map((member) => (
          <div className="table-row" key={member.id}>
            <span>
              <i className="member-avatar">
                {(member.fullName ?? member.email).slice(0, 1)}
              </i>
              <b>{member.fullName || member.email}</b>
              <small>{member.email}</small>
            </span>
            <span>
              <ShieldCheck /> {member.role}
            </span>
            <span>{formatDate(member.createdAt)}</span>
            <span className="status-text success">Active</span>
            <button>
              <MoreHorizontal />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingPage({ data }: { data: WorkspaceData }) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  async function checkout(plan: string) {
    setBusy(plan);
    setMessage("");
    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !result.url)
        throw new Error(result.error || "Unable to create checkout.");
      window.location.href = result.url;
    } catch (failure) {
      setMessage(
        failure instanceof Error
          ? failure.message
          : "Unable to create checkout.",
      );
    } finally {
      setBusy("");
    }
  }
  const limit = data.plan?.handoffLimit ?? 150;
  return (
    <>
      <PageTitle
        eyebrow="SUBSCRIPTION"
        title="Billing & Usage"
        text="Manage plan capacity, subscription status, and metered handoff usage."
      />
      <div className="current-plan">
        <div>
          <span>CURRENT PLAN</span>
          <h2>{data.plan?.name ?? "Free Trial"}</h2>
          <p>{data.subscription?.status ?? "trialing"} · Monthly billing</p>
        </div>
        <div>
          <strong>
            {data.metrics.total.toLocaleString()}{" "}
            <small>
              / {limit >= 2147483647 ? "Unlimited" : limit.toLocaleString()}{" "}
              handoffs
            </small>
          </strong>
          <div>
            <i
              style={{
                width: `${limit >= 2147483647 ? 0 : Math.min(100, (data.metrics.total / limit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
      {message && (
        <div className="page-error">
          <AlertTriangle />
          {message}
        </div>
      )}
      <div className="billing-plans">
        {pricingPlans.map((plan) => (
          <article
            key={plan.id}
            className={data.plan?.id === plan.id ? "active" : ""}
          >
            <span>{data.plan?.id === plan.id ? "CURRENT" : "PLAN"}</span>
            <h3>{plan.name}</h3>
            <strong>
              {plan.price}
              <small>{plan.monthlyPriceCents ? "/month" : ""}</small>
            </strong>
            <p>
              {plan.handoffs} handoffs
              {plan.id === "enterprise" ? " + customisation" : " / month"}
            </p>
            {plan.id === "enterprise" ? (
              <a href="/contact" className="button button--secondary">
                Contact sales
              </a>
            ) : (
              <button
                className="button button--secondary"
                disabled={
                  busy === plan.id ||
                  data.plan?.id === plan.id ||
                  plan.id === "free-trial"
                }
                onClick={() => void checkout(plan.id)}
              >
                {busy === plan.id ? (
                  <LoaderCircle className="spin" />
                ) : data.plan?.id === plan.id ? (
                  "Current plan"
                ) : plan.id === "free-trial" ? (
                  "Included"
                ) : (
                  "Choose plan"
                )}
              </button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsPage({
  data,
  refresh,
}: {
  data: WorkspaceData;
  refresh: () => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await updateUser({ data: { full_name: String(form.get("name")) } });
      setMessage("Profile updated successfully.");
      await refresh();
    } catch {
      setMessage("Unable to update the profile.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="WORKSPACE CONTROL"
        title="Settings"
        text="Manage your profile, organization defaults, webhook guidance, and security history."
      />
      <div className="settings-grid">
        <Panel title="Profile">
          <form className="settings-form" onSubmit={save}>
            <label>
              Full name
              <input name="name" defaultValue={data.profile.fullName ?? ""} />
            </label>
            <label>
              Email
              <input value={data.profile.email} disabled />
            </label>
            <button className="button button--primary" disabled={busy}>
              {busy ? <LoaderCircle className="spin" /> : "Save profile"}
            </button>
            {message && <small>{message}</small>}
          </form>
        </Panel>
        <Panel title="Workspace">
          <div className="settings-form">
            <label>
              Organization
              <input value={data.organization.name} readOnly />
            </label>
            <label>
              Workspace slug
              <input value={data.organization.slug} readOnly />
            </label>
            <label>
              Your role
              <input value={data.role} readOnly />
            </label>
          </div>
        </Panel>
        <Panel title="Webhook security">
          <div className="webhook-settings">
            <Webhook />
            <p>
              Configure a project webhook URL and validate every event using the
              HMAC signature and timestamp headers.
            </p>
            <a href="/documentation" className="button button--secondary">
              Read webhook guide <ExternalLink />
            </a>
          </div>
        </Panel>
        <Panel title="Audit log">
          <div className="audit-list">
            {data.auditLogs.map((item) => (
              <div key={item.id}>
                <FileClock />
                <span>
                  <strong>{humanize(item.action)}</strong>
                  <small>
                    {item.targetType} · {formatDate(item.createdAt)}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function SupportPage({ data }: { data: WorkspaceData }) {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("busy");
    const form = new FormData(event.currentTarget);
    try {
      await createSupportTicket({
        data: {
          subject: String(form.get("subject")),
          description: String(form.get("description")),
          priority: String(form.get("priority")) as
            | "low"
            | "normal"
            | "high"
            | "urgent",
        },
      });
      event.currentTarget.reset();
      setState("sent");
    } catch (failure) {
      setState("idle");
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to create the support ticket.",
      );
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="CUSTOMER ENGINEERING"
        title="Support"
        text={`Get implementation and operational help for ${data.organization.name}.`}
      />
      <div className="support-grid">
        <div>
          <article>
            <LifeBuoy />
            <h2>Implementation support</h2>
            <p>
              SDK integration, context modeling, webhooks, reliability, and
              go-live review.
            </p>
          </article>
          <article>
            <ShieldCheck />
            <h2>Security support</h2>
            <p>
              Architecture review, access controls, retention, vendor
              assessment, and incident response.
            </p>
          </article>
          <article>
            <Github />
            <h2>Developer resources</h2>
            <p>
              API documentation, examples, status guidance, and troubleshooting
              runbooks.
            </p>
            <a href="/documentation">
              Open documentation <ArrowRight />
            </a>
          </article>
        </div>
        <Panel title="Open a support ticket">
          <form onSubmit={submit} className="modal-form">
            <label>
              Subject
              <input
                name="subject"
                minLength={4}
                required
                placeholder="Help with webhook verification"
              />
            </label>
            <label>
              Priority
              <select name="priority">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent — production impact</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label>
              Details
              <textarea
                name="description"
                minLength={10}
                rows={7}
                required
                placeholder="Include the project, request ID, expected behavior, and observed result. Never include secret API keys."
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            {state === "sent" && (
              <div className="auth-success">
                Ticket created. The support team has your request.
              </div>
            )}
            <button
              className="button button--primary"
              disabled={state === "busy"}
            >
              {state === "busy" ? (
                <LoaderCircle className="spin" />
              ) : (
                "Create support ticket"
              )}
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>
        <i /> Live workspace data
      </p>
    </article>
  );
}
function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <header>
        <h2>{title}</h2>
        <button>
          <MoreHorizontal />
        </button>
      </header>
      {children}
    </section>
  );
}
function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button onClick={close}>
            <X />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
function ActivityList({ data }: { data: WorkspaceData }) {
  if (!data.auditLogs.length)
    return <div className="mini-empty">Workspace activity appears here.</div>;
  return (
    <div className="activity-list">
      {data.auditLogs.slice(0, 5).map((item) => (
        <div key={item.id}>
          <span>
            <Activity />
          </span>
          <div>
            <strong>{humanize(item.action)}</strong>
            <small>{item.targetType ?? "workspace"}</small>
          </div>
          <time>{formatDate(item.createdAt)}</time>
        </div>
      ))}
    </div>
  );
}
function ProjectBars({ data }: { data: WorkspaceData }) {
  if (!data.projects.length)
    return <div className="mini-empty">No project usage yet.</div>;
  const counts = data.projects.map((project) => ({
    ...project,
    count: data.conversations.filter(
      (conversation) => conversation.projectId === project.id,
    ).length,
  }));
  const max = Math.max(1, ...counts.map((item) => item.count));
  return (
    <div className="project-bars">
      {counts.slice(0, 5).map((item) => (
        <div key={item.id}>
          <span>
            <strong>{item.name}</strong>
            <small>{item.count} conversations</small>
          </span>
          <div>
            <i style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <b>{Math.round((item.count / max) * 100)}%</b>
        </div>
      ))}
    </div>
  );
}
function buildChart(handoffs: WorkspaceData["handoffs"]) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      handoffs: 0,
    };
  });
  for (const handoff of handoffs) {
    const point = days.find(
      (day) =>
        day.key === new Date(handoff.createdAt).toISOString().slice(0, 10),
    );
    if (point) point.handoffs += 1;
  }
  return days;
}
function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function humanize(value: string) {
  return value
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function DashboardLoading() {
  return (
    <div className="dashboard-loading">
      <Logo />
      <div className="loading-grid">
        <i />
        <i />
        <i />
        <i />
      </div>
      <p>Loading your secure workspace…</p>
    </div>
  );
}
