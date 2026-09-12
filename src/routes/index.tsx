import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  CircleUserRound,
  DatabaseZap,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { useState } from "react";
import { MarketingLayout } from "@/components/site-shell";
import { openArchitect } from "@/components/architect-chat";

export const Route = createFileRoute("/")({ component: LandingPage });

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

function LandingPage() {
  return (
    <MarketingLayout>
      <main>
        <section className="hero page-width">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <i /> Conversation continuity infrastructure
            </span>
            <h1>
              Make every conversation
              <br />
              <em>feel uninterrupted.</em>
            </h1>
            <p>
              HandoffOS moves complete conversational context between AI and
              human teams in real time—so customers never repeat themselves and
              agents never start cold.
            </p>
            <div className="hero-actions">
              <Link
                to="/signup"
                className="button button--primary button--large"
              >
                Create your workspace <ArrowRight size={17} />
              </Link>
              <button
                onClick={openArchitect}
                className="button button--secondary button--large"
              >
                <Bot size={16} /> Talk to an Architect
              </button>
            </div>
            <div className="hero-proof">
              <span>
                <Check /> No credit card
              </span>
              <span>
                <Check /> Production-ready SDKs
              </span>
              <span>
                <Check /> Deploy in minutes
              </span>
            </div>
          </motion.div>
          <motion.div
            className="handoff-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="visual-grid" />
            <div className="handoff-node handoff-node--ai">
              <span>
                <Bot />
              </span>
              <div>
                <small>SOURCE</small>
                <strong>AI Agent</strong>
                <p>Intent · history · sentiment</p>
              </div>
            </div>
            <div className="context-stream">
              <span>CONTEXT ENVELOPE</span>
              <div className="stream-line">
                <i />
                <i />
                <i />
                <i />
              </div>
              <strong>100% synchronized</strong>
            </div>
            <div className="handoff-node handoff-node--human">
              <span>
                <CircleUserRound />
              </span>
              <div>
                <small>DESTINATION</small>
                <strong>Human Expert</strong>
                <p>Ready with full context</p>
              </div>
            </div>
            <div className="visual-caption">
              <RefreshCw /> Bidirectional by design <b>AI ↔ HUMAN</b>
            </div>
          </motion.div>
        </section>

        <section className="trust-strip">
          <span>BUILT FOR TEAMS WHERE CONTEXT IS MISSION-CRITICAL</span>
          <div>
            <b>FINTECH</b>
            <b>HEALTHCARE</b>
            <b>COMMERCE</b>
            <b>SUPPORT</b>
            <b>LEGAL AI</b>
            <b>DEVTOOLS</b>
          </div>
        </section>

        <section className="section page-width flow-section">
          <motion.div {...fade} className="section-heading">
            <span className="kicker">ONE CONTROL PLANE</span>
            <h2>
              Intelligence moves.
              <br />
              Context stays intact.
            </h2>
            <p>
              Standardize every transfer across models, channels, vendors, and
              teams with one secure handoff layer.
            </p>
          </motion.div>
          <div className="flow-grid">
            <FlowCard
              icon={<Bot />}
              accent="blue"
              label="AI → HANDOFFOS → HUMAN"
              title="Escalate without starting over"
              text="Route high-value or complex conversations to the right expert with complete summaries, transcript, intent, entities, and recommended actions."
            />
            <div className="flow-core">
              <div className="core-rings">
                <img
                  src="/assets/handoffos-logo.jpeg"
                  alt="HandoffOS context engine"
                />
              </div>
              <span>CONTEXT ENGINE</span>
            </div>
            <FlowCard
              icon={<CircleUserRound />}
              accent="green"
              label="HUMAN → HANDOFFOS → AI"
              title="Return control without losing nuance"
              text="Hand work back to automation with the human's decisions, updates, commitments, and next-best actions structured for any agent."
            />
          </div>
        </section>

        <LiveDemo />

        <section className="section page-width">
          <motion.div
            {...fade}
            className="section-heading section-heading--center"
          >
            <span className="kicker">BUILT FOR PRODUCTION</span>
            <h2>
              The infrastructure behind
              <br />
              continuous conversations.
            </h2>
          </motion.div>
          <div className="feature-grid">
            <Feature
              icon={<DatabaseZap />}
              title="Lossless context envelopes"
              text="Messages, tool calls, customer state, sentiment, entities, attachments, and policies travel together."
            />
            <Feature
              icon={<Gauge />}
              title="Real-time orchestration"
              text="Sub-second routing, queues, assignment rules, retries, and delivery observability."
            />
            <Feature
              icon={<Webhook />}
              title="API-first and event-driven"
              text="Typed SDKs, secure webhooks, idempotent APIs, and a production-ready playground."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Enterprise controls"
              text="Role-based access, immutable audit trails, scoped keys, retention controls, and secure secrets."
            />
            <Feature
              icon={<Braces />}
              title="Model and channel agnostic"
              text="Connect any AI runtime, helpdesk, CRM, contact center, or custom human workflow."
            />
            <Feature
              icon={<LockKeyhole />}
              title="Privacy by architecture"
              text="Keep sensitive context bounded to your organization, project, and authorized operators."
            />
          </div>
        </section>

        <section className="developer-band">
          <div className="page-width developer-grid">
            <div>
              <span className="kicker">FROM ZERO TO FIRST HANDOFF</span>
              <h2>
                Four steps.
                <br />
                One continuous customer journey.
              </h2>
              <ol>
                <li>
                  <b>01</b>
                  <span>
                    <strong>Create a project</strong>Isolate environments,
                    teams, and usage.
                  </span>
                </li>
                <li>
                  <b>02</b>
                  <span>
                    <strong>Generate an API key</strong>Use scoped, revocable
                    credentials.
                  </span>
                </li>
                <li>
                  <b>03</b>
                  <span>
                    <strong>Install your SDK</strong>Choose TypeScript, Python,
                    Go, or REST.
                  </span>
                </li>
                <li>
                  <b>04</b>
                  <span>
                    <strong>Send the first handoff</strong>Watch context arrive
                    in real time.
                  </span>
                </li>
              </ol>
            </div>
            <CodeWindow />
          </div>
        </section>

        <section className="final-cta page-width">
          <Sparkles />
          <span className="kicker">ZERO CONTEXT LOSS STARTS HERE</span>
          <h2>
            Make every conversation
            <br />
            feel uninterrupted.
          </h2>
          <p>Start with 150 handoffs at ₹0. Scale when your customers do.</p>
          <div>
            <Link to="/signup" className="button button--primary button--large">
              Create your workspace <ArrowRight size={17} />
            </Link>
            <button
              onClick={openArchitect}
              className="button button--secondary button--large"
            >
              Talk to an Architect
            </button>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}

function FlowCard({
  icon,
  accent,
  label,
  title,
  text,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <motion.article {...fade} className={`flow-card flow-card--${accent}`}>
      <div className="flow-icon">{icon}</div>
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <a href="#demo">
        See the handoff flow <ArrowRight size={15} />
      </a>
    </motion.article>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.article {...fade} className="feature-card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.article>
  );
}

function LiveDemo() {
  const [direction, setDirection] = useState<"ai" | "human">("ai");
  const [stage, setStage] = useState(0);
  const run = () => {
    setStage(1);
    window.setTimeout(() => setStage(2), 450);
    window.setTimeout(() => setStage(3), 900);
    window.setTimeout(() => setStage(4), 1350);
    window.setTimeout(() => setStage(5), 1800);
  };
  return (
    <section id="demo" className="demo-section">
      <div className="page-width">
        <motion.div
          {...fade}
          className="section-heading section-heading--center"
        >
          <span className="kicker">
            <i /> LIVE INTERACTIVE DEMO
          </span>
          <h2>See context continuity happen.</h2>
          <p>
            Choose a direction, initiate the handoff, and inspect the exact
            context package received on the other side.
          </p>
        </motion.div>
        <div className="demo-shell">
          <div className="demo-toolbar">
            <div>
              <i />
              <i />
              <i />
            </div>
            <strong>HandoffOS Runtime</strong>
            <span>LIVE SANDBOX</span>
          </div>
          <div className="demo-tabs">
            <button
              className={direction === "ai" ? "active" : ""}
              onClick={() => {
                setDirection("ai");
                setStage(0);
              }}
            >
              <Bot /> AI → Human
            </button>
            <button
              className={direction === "human" ? "active" : ""}
              onClick={() => {
                setDirection("human");
                setStage(0);
              }}
            >
              <CircleUserRound /> Human → AI
            </button>
          </div>
          <div className="demo-stages" aria-label="Handoff progress">
            {[
              "Conversation",
              "Handoff Triggered",
              "Context Prepared",
              "Context Transferred",
              direction === "ai" ? "Agent Continues" : "AI Continues",
            ].map((label, index) => (
              <span key={label} className={stage >= index + 1 ? "active" : ""}>
                <i>{index + 1}</i>
                {label}
              </span>
            ))}
          </div>
          <div className="demo-content">
            <div className="conversation-pane">
              <span className="pane-label">LIVE CONVERSATION</span>
              <Message
                from="Customer"
                text="My enterprise export failed again. We have a compliance filing due today."
              />
              <Message
                from={direction === "ai" ? "AI Copilot" : "Maya · Support"}
                text={
                  direction === "ai"
                    ? "I found the failed job and your prior escalation. I'm bringing in a specialist with everything we've covered."
                    : "I've corrected the export scope and documented the compliance deadline. Automation can monitor the rerun from here."
                }
                accent
              />
              <button
                className="handoff-button"
                onClick={run}
                disabled={stage > 0 && stage < 5}
              >
                {stage === 0 || stage === 5
                  ? `Initiate ${direction === "ai" ? "AI → Human" : "Human → AI"} handoff`
                  : "HandoffOS is transferring context…"}
              </button>
            </div>
            <div className="context-pane">
              <div className="context-header">
                <div>
                  <span className="pane-label">HANDOFF CONTEXT PREVIEW</span>
                  <strong>
                    {stage < 5
                      ? "Preparing and transferring context"
                      : "Recipient continued with full context"}
                  </strong>
                </div>
                <span
                  className={
                    stage === 5
                      ? "status-pill status-pill--success"
                      : "status-pill"
                  }
                >
                  {stage === 5 ? "DELIVERED" : "PROCESSING"}
                </span>
              </div>
              <ContextRow
                label="Customer intent"
                value="Restore enterprise export before filing deadline"
                active={stage >= 1}
              />
              <ContextRow
                label="Conversation summary"
                value="Second export failure; previous incident HO-2841 linked"
                active={stage >= 1}
              />
              <ContextRow
                label="Sentiment & urgency"
                value="High urgency · Frustrated · Compliance risk"
                active={stage >= 2}
              />
              <ContextRow
                label="Entities & state"
                value="Job exp_98AB · Enterprise plan · US-East"
                active={stage >= 2}
              />
              <ContextRow
                label="Recommended next action"
                value={
                  direction === "ai"
                    ? "Assign export specialist and preserve SLA clock"
                    : "Monitor rerun and notify customer on completion"
                }
                active={stage >= 5}
              />
              <div className="context-score">
                <span>Context completeness</span>
                <strong>
                  {stage === 0
                    ? "0"
                    : stage === 1
                      ? "20"
                      : stage === 2
                        ? "45"
                        : stage === 3
                          ? "72"
                          : stage === 4
                            ? "92"
                            : "100"}
                  %
                </strong>
                <div>
                  <i
                    style={{
                      width: `${stage === 0 ? 0 : stage === 1 ? 20 : stage === 2 ? 45 : stage === 3 ? 72 : stage === 4 ? 92 : 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Message({
  from,
  text,
  accent = false,
}: {
  from: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <div
      className={accent ? "demo-message demo-message--accent" : "demo-message"}
    >
      <div>{from.slice(0, 1)}</div>
      <span>
        <strong>{from}</strong>
        <p>{text}</p>
      </span>
    </div>
  );
}
function ContextRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className={active ? "context-row active" : "context-row"}>
      <Check />
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}
function CodeWindow() {
  return (
    <div className="code-window">
      <div className="code-top">
        <span>
          <i />
          <i />
          <i />
        </span>
        <b>first-handoff.ts</b>
        <em>TypeScript</em>
      </div>
      <pre>
        <code>
          <span className="c-purple">import</span> {"{ HandoffOS }"}{" "}
          <span className="c-purple">from</span>{" "}
          <span className="c-green">'@handoffos/sdk'</span>
          {`\n\n`}
          <span className="c-purple">const</span> handoff ={" "}
          <span className="c-purple">await</span> client.handoffs.create({"{"}
          {`\n  `}direction: <span className="c-green">'ai_to_human'</span>,
          {`\n  `}conversation_id: <span className="c-green">'conv_98AB'</span>,
          {`\n  `}context: {"{"}
          {`\n    `}summary,{`\n    `}messages,{`\n    `}customer,{`\n    `}
          recommended_action{`\n  `}
          {"}"}
          {`\n`}
          {"}"}){`\n\n`}
          <span className="c-blue">console</span>.log(handoff.status){`\n`}
          <span className="c-muted">// → delivered</span>
        </code>
      </pre>
    </div>
  );
}
