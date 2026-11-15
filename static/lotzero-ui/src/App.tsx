import { useEffect, useRef } from "react";
import Button from "@atlaskit/button/new";
import { useRehearsal } from "./hooks/useRehearsal";
import { useHostTheme } from "./hooks/useHostTheme";
import AppShell from "./components/AppShell";
import CaseHeader from "./components/CaseHeader";
import ConfirmDialog from "./components/ConfirmDialog";
import Home from "./screens/Home";
import Rehearsal from "./screens/Rehearsal";
import Rehearse from "./screens/Rehearse";
import FollowUp from "./screens/FollowUp";
import NewDrillForm from "./screens/NewDrillForm";
import { recoveryFor } from "./recovery";

export default function App() {
  const desk = useRehearsal();
  useHostTheme();
  const heading = useRef<HTMLDivElement>(null);
  const active = desk.active;
  const busy = Boolean(desk.busy);
  useEffect(() => {
    if (desk.screen !== "rehearsal")
      heading.current
        ?.querySelector<HTMLElement>("h1")
        ?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [desk.screen]);
  return (
    <AppShell
      onHome={() => {
        if (!busy) desk.go("home");
      }}
    >
      {desk.error && (
        <div role="alert" className="error-message">
          <strong>{desk.error}</strong>
          <p>{recoveryFor(desk.error).message}</p>
          <Button
            isDisabled={busy}
            onClick={() =>
              void desk.perform("Refreshing saved state", desk.refresh)
            }
          >
            Refresh saved state
          </Button>
        </div>
      )}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="operation-status"
      >
        {desk.busy || desk.notice}
      </div>
      <div ref={heading}>
        {desk.screen === "home" ? (
          <Home desk={desk} />
        ) : desk.screen === "new" && desk.data.dataset ? (
          <>
            <Button isDisabled={busy} onClick={() => desk.go("home")}>
              Back to Home
            </Button>
            <h1 tabIndex={-1}>New drill</h1>
            <NewDrillForm
              dataset={desk.data.dataset}
              onRun={desk.run}
              disabled={busy}
            />
          </>
        ) : active ? (
          <>
            <CaseHeader result={active.result} snapshot={active.snapshot} />
            <nav className="case-navigation" aria-label="Rehearsal navigation">
              <button
                disabled={busy}
                aria-current={desk.screen === "rehearsal" ? "step" : undefined}
                onClick={() => desk.go("rehearsal")}
              >
                Trace
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  desk.go("rehearsal");
                  requestAnimationFrame(
                    () =>
                      document
                        .querySelector<HTMLElement>(".finding-row.selected")
                        ?.focus(),
                  );
                }}
              >
                Findings
              </button>
              <button
                disabled={busy}
                aria-current={desk.screen === "rehearse" ? "step" : undefined}
                onClick={() => desk.go("rehearse")}
              >
                Rehearse
              </button>
              <button
                disabled={busy || !active.snapshot}
                aria-current={desk.screen === "follow-up" ? "step" : undefined}
                title={
                  !active.snapshot ? "Save and follow up first" : undefined
                }
                onClick={desk.followUp}
              >
                Follow-up
              </button>
            </nav>
            {desk.screen === "rehearsal" ? (
              <Rehearsal desk={desk} />
            ) : desk.screen === "rehearse" ? (
              <>
                <h2>Rehearse</h2>
                <Rehearse
                  dataset={active.dataset}
                  result={active.result}
                  onUpdate={desk.update}
                  onReview={desk.followUp}
                  busy={busy}
                  suggestedTarget={desk.suggestedTarget}
                />
              </>
            ) : (
              <FollowUp desk={desk} />
            )}
          </>
        ) : null}
      </div>
      {desk.confirmation && (
        <ConfirmDialog
          alert
          titleId="replace-title"
          onClose={() => desk.setConfirmation(null)}
        >
          <h2 id="replace-title">Keep or replace the current work?</h2>
          <p>{desk.confirmation.message}</p>
          <div className="button-row">
            <Button onClick={() => desk.setConfirmation(null)}>
              Keep current work
            </Button>
            <Button appearance="danger" onClick={desk.confirmation.accept}>
              Replace current work
            </Button>
          </div>
        </ConfirmDialog>
      )}
    </AppShell>
  );
}
