import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  title: string;
  detail: string;
  href: string;
  terms: string;
};
const staticItems: SearchItem[] = [
  [
    "Integration Process",
    "Choose, configure, create a key, install the SDK, and test",
    "/dashboard/integration-process",
    "integration setup webhook slack zendesk intercom",
  ],
  [
    "API Key",
    "Generate and manage scoped server credentials",
    "/dashboard/api-keys",
    "api key credentials secret hash",
  ],
  [
    "SDK Download",
    "Install TypeScript, Python, Go, or use REST",
    "/dashboard/sdk-downloads",
    "sdk npm typescript python go rest documentation",
  ],
  [
    "Analytics",
    "Handoff volume, direction, latency, and success",
    "/dashboard/analytics",
    "analytics metrics usage",
  ],
  [
    "Conversations",
    "Inspect conversations and transferred context",
    "/dashboard/conversations",
    "conversation handoff context summary",
  ],
  [
    "Team",
    "Workspace members and roles",
    "/dashboard/team",
    "team members roles",
  ],
  [
    "Billing",
    "Plans, capacity, and subscription",
    "/dashboard/billing",
    "billing pricing free standard pro advanced business enterprise",
  ],
  [
    "Settings",
    "Workspace profile and webhook configuration",
    "/dashboard/settings",
    "settings workspace webhook",
  ],
  [
    "Support",
    "Troubleshooting and support tickets",
    "/dashboard/support",
    "support troubleshooting help",
  ],
].map(([title, detail, href, terms]) => ({ title, detail, href, terms }));

export function DashboardSearch() {
  const [visible, setVisible] = useState(false),
    [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [dynamic, setDynamic] = useState<SearchItem[]>([]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setVisible(true);
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  useEffect(() => {
    if (visible) {
      const payload =
        (window as typeof window & { __handoffSearch?: Array<SearchItem> })
          .__handoffSearch ?? [];
      setDynamic(payload);
      window.setTimeout(() => input.current?.focus(), 20);
    }
  }, [visible]);
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return [...dynamic, ...staticItems]
      .filter(
        (item) =>
          !q ||
          `${item.title} ${item.detail} ${item.terms}`
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 9);
  }, [query, dynamic]);
  if (
    typeof window === "undefined" ||
    !window.location.pathname.startsWith("/dashboard")
  )
    return null;
  return (
    <>
      <button
        className="dashboard-search-trigger"
        onClick={() => setVisible(true)}
      >
        <Search /> Search conversations, handoffs, docs… <kbd>⌘K</kbd>
      </button>
      {visible && (
        <div className="search-backdrop" onMouseDown={() => setVisible(false)}>
          <section
            className="search-dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <Search />
              <input
                ref={input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search HandoffOS"
              />
              <button onClick={() => setVisible(false)}>
                <X />
              </button>
            </header>
            <div>
              {results.map((item) => (
                <a href={item.href} key={`${item.href}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </a>
              ))}
              {!results.length && (
                <div className="search-empty">
                  <Search />
                  <strong>No results for “{query}”</strong>
                  <span>
                    Try a conversation ID, handoff ID, integration, SDK, or
                    setting.
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
