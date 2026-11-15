import { useEffect, useState } from "react";
import type { ReturnTypeOfUseRehearsal } from "../types";
import JiraApproval from "../components/JiraApproval";
import AnalystHandoff from "../components/AnalystHandoff";
import ReportTools from "../components/ReportTools";
import { savedRevision } from "../analyst";

export default function FollowUp({ desk }: { desk: ReturnTypeOfUseRehearsal }) {
  const snapshot = desk.active?.snapshot;
  const [revision, setRevision] = useState("");
  useEffect(() => {
    let current = true;
    setRevision("");
    if (snapshot)
      void savedRevision(snapshot)
        .then((value) => {
          if (current) setRevision(value);
        })
        .catch(() => {
          if (current) setRevision("Revision unavailable");
        });
    return () => {
      current = false;
    };
  }, [snapshot]);
  if (!snapshot) return null;
  return (
    <>
      <div className="follow-up-heading">
        <h2>Follow-up</h2>
        <p className="saved-reference">
          Saved <code title={snapshot.id}>{snapshot.id.slice(0, 18)}…</code> ·
          revision{" "}
          <code title={revision}>
            {revision ? revision.slice(0, 12) : "Calculating"}
          </code>
        </p>
        <details>
          <summary>Full saved reference</summary>
          <p>
            ID <code>{snapshot.id}</code>
          </p>
          <p>
            Revision <code>{revision || "Calculating"}</code>
          </p>
        </details>
      </div>
      <JiraApproval
        actions={desk.active!.actions}
        snapshot={snapshot}
        defaultProjectKey={desk.data.project?.key}
        disabled={Boolean(desk.busy)}
        onCreate={async (payload) => {
          await desk.create(payload);
        }}
        onReconcile={async (id, key) => {
          await desk.reconcile(id, key);
        }}
      />
      <AnalystHandoff
        snapshot={snapshot}
        projectKey={desk.data.project?.key}
        local={desk.data.mode === "local"}
      />
      <ReportTools
        key={snapshot.id}
        snapshot={snapshot}
        snapshots={desk.data.snapshots}
      />
    </>
  );
}
