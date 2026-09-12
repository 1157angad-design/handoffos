import { Bot, LoaderCircle, MessageSquareText, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
const welcome: ChatMessage = {
  role: "assistant",
  content:
    "I’m the HandoffOS Architect. Ask me about conversation continuity, integrations, setup, SDKs, pricing, or the page you’re viewing.",
};

export function openArchitect() {
  window.dispatchEvent(new Event("handoffos:architect"));
}

export function ArchitectChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("handoffos:architect", show);
    return () => window.removeEventListener("handoffos:architect", show);
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const content = String(form.get("question") || "").trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setBusy(true);
    setError("");
    event.currentTarget.reset();
    try {
      const response = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: window.location.pathname,
          messages: next.slice(1),
        }),
      });
      const result = (await response.json()) as {
        answer?: string;
        error?: string;
      };
      if (!response.ok)
        throw new Error(result.error || "Unable to reach the Architect.");
      setMessages((items) => [
        ...items,
        { role: "assistant", content: result.answer || "Please try again." },
      ]);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to reach the Architect.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="architect-launcher" onClick={() => setOpen(true)}>
        <Bot />
        <span>Talk to Architect</span>
      </button>
      {open && (
        <div
          className="architect-panel"
          role="dialog"
          aria-label="HandoffOS AI Architect"
        >
          <header>
            <span>
              <Bot />
            </span>
            <div>
              <strong>HandoffOS Architect</strong>
              <small>
                <i /> Product guide online
              </small>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close Architect">
              <X />
            </button>
          </header>
          <div className="architect-messages">
            {messages.map((message, index) => (
              <div key={index} className={`architect-message ${message.role}`}>
                <small>
                  {message.role === "assistant" ? "ARCHITECT" : "YOU"}
                </small>
                <p>{message.content}</p>
              </div>
            ))}
            {busy && (
              <div className="architect-message assistant loading">
                <LoaderCircle className="spin" /> Reading product context…
              </div>
            )}
            {error && <div className="architect-error">{error}</div>}
            <div ref={end} />
          </div>
          <form onSubmit={submit}>
            <MessageSquareText />
            <input
              name="question"
              aria-label="Ask the Architect"
              placeholder="How does an AI → human handoff work?"
              autoComplete="off"
            />
            <button disabled={busy} aria-label="Send question">
              <Send />
            </button>
          </form>
          <footer>
            Answers are grounded in implemented HandoffOS capabilities.
          </footer>
        </div>
      )}
    </>
  );
}
