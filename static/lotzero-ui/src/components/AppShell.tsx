import type { ReactNode } from "react";
import { localMode } from "../client";
export default function AppShell({
  onHome,
  children,
}: {
  onHome: () => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to rehearsal
      </a>
      <header className="app-bar">
        <button
          className="brand-link"
          onClick={onHome}
          aria-label="LotZero Home"
        >
          LotZero
        </button>
        <span className="transport-hint">
          {localMode
            ? "Browser preview · Jira writes disabled"
            : "Jira · Recall rehearsal"}
        </span>
        <span className="synthetic-hint">Simulation only</span>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="app-footer">
        Rehearsal only. No operational recall is performed.
      </footer>
    </div>
  );
}
