import { useState, type ReactNode } from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    plus: "M12 5v14 M5 12h14",
    graph:
      "M4 12h6 M14 6h6 M14 18h6 M10 12l4-6 M10 12l4 6 M2 10h4v4H2z M18 4h4v4h-4z M18 16h4v4h-4z",
    gap: "M12 3l10 18H2z M12 9v5 M12 17h.01",
    control: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
    jira: "M12 3l9 9-9 9-9-9z M9 9h6v6H9z",
    report: "M6 3h9l3 3v15H6z M9 10h6 M9 14h6 M9 18h4",
    arrow: "M5 12h14 M14 7l5 5-5 5",
    check: "M5 12l4 4L19 6",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2",
    download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
    search: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M15 15l6 6",
    refresh: "M20 8a8 8 0 1 0 0 8 M20 3v5h-5",
    close: "M6 6l12 12 M18 6L6 18",
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge ${value.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {value}
    </span>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-symbol">
        <Icon name="graph" size={32} />
      </div>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Metric({
  value,
  label,
  note,
}: {
  value: ReactNode;
  label: string;
  note: string;
}) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="metric-note">{note}</span>
    </div>
  );
}
export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function JiraIssueLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const [error, setError] = useState("");
  if (import.meta.env.VITE_LOCAL_DEMO === "true")
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  return (
    <span>
      <button
        className="text-link"
        onClick={() =>
          void (async () => {
            try {
              if (!href.startsWith("https://"))
                throw new Error("Invalid Jira link.");
              const { router } = await import("@forge/bridge");
              await router.open(href);
              setError("");
            } catch {
              setError(
                "Jira could not be opened. Copy the issue key and open it from Jira search.",
              );
            }
          })()
        }
      >
        {children}
      </button>
      {error && (
        <span role="alert" className="inline-error">
          {error}
        </span>
      )}
    </span>
  );
}
