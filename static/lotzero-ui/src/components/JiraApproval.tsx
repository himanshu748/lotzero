import { useState, useEffect } from "react";
import type { JiraAction, Snapshot, Project } from "../../../../src/contracts";
import { client, localMode } from "../client";
import { groupActions } from "../../../../src/services/action-findings";
import { Badge, Empty, Icon, JiraIssueLink } from "./Primitives";
const message = (error: unknown) =>
  error instanceof Error ? error.message : "Jira could not be read. Try again.";
export default function JiraApproval({
  actions,
  snapshot,
  defaultProjectKey,
  disabled,
  onCreate,
  onReconcile,
}: {
  actions: JiraAction[];
  snapshot: Snapshot | null;
  defaultProjectKey?: string;
  disabled: boolean;
  onCreate: (p: {
    snapshotId: string;
    projectKey: string;
    issueTypeId: string;
    actionIds: string[];
    approved: true;
    receiptsOnly?: true;
  }) => Promise<void>;
  onReconcile: (actionId: string, issueKey: string) => Promise<void>;
}) {
  const [reconcileKeys, setReconcileKeys] = useState<Record<string, string>>(
    {},
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState("");
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [issueType, setIssueType] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setChosen([]);
    setApproved(false);
  }, [actions]);
  useEffect(() => {
    let current = true;
    client
      .listProjects()
      .then((p) => {
        if (current) {
          setProjects(p);
          setProject(
            p.some((item) => item.key === defaultProjectKey)
              ? defaultProjectKey!
              : "",
          );
        }
      })
      .catch((e) => setError(message(e)));
    return () => {
      current = false;
    };
  }, [defaultProjectKey]);
  useEffect(() => {
    setTypes([]);
    setIssueType("");
    setApproved(false);
    if (!project) return;
    let current = true;
    setTypes([]);
    setIssueType("");
    setApproved(false);
    client
      .issueTypes(project)
      .then((t) => {
        if (current) {
          setTypes(t);
          setIssueType(t[0]?.id ?? "");
        }
      })
      .catch((e) => setError(message(e)));
    return () => {
      current = false;
    };
  }, [project]);
  return (
    <>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <div className="jira-layout">
        <section className="action-list">
          {(snapshot ? groupActions(snapshot.result, actions) : []).map(
            (group, groupIndex) => (
              <details
                open={
                  groupIndex === 0 ||
                  group.actions.some(
                    (a) => a.issueKey || a.status === "uncertain",
                  )
                }
                className="action-group"
                key={group.id}
                aria-label={group.title}
              >
                <summary className="action-group-heading">
                  <Badge value={group.status} />
                  <h3>{group.title}</h3>
                  <span>
                    {group.actions.length} proposed
                    {group.actions.some((a) => a.status === "uncertain")
                      ? " · reconciliation needed"
                      : ""}
                  </span>
                </summary>
                {group.actions.map((a, index) => {
                  const card = (
                    <article className="panel action-card" key={a.id}>
                      <div className="action-title">
                        <input
                          type="checkbox"
                          aria-label={`Select ${a.summary}`}
                          checked={chosen.includes(a.id)}
                          disabled={
                            Boolean(a.issueKey) ||
                            a.status === "uncertain" ||
                            disabled ||
                            (!chosen.includes(a.id) && chosen.length >= 5)
                          }
                          onChange={(e) => {
                            setChosen(
                              e.target.checked
                                ? [...chosen, a.id]
                                : chosen.filter((id) => id !== a.id),
                            );
                            setApproved(false);
                          }}
                        />
                        <div>
                          <h2>{a.summary}</h2>
                          <p className="mono">{a.recordIds.join(" · ")}</p>
                        </div>
                        <Badge value={a.status ?? "Suggested"} />
                      </div>
                      <details>
                        <summary>Preview issue description & evidence</summary>
                        <pre className="issue-description">{a.description}</pre>
                      </details>
                      {a.issueKey && (
                        <p className="issue-receipt">
                          <Icon name="check" size={16} />
                          {a.issueUrl?.startsWith("https://") ? (
                            <JiraIssueLink href={a.issueUrl}>
                              {a.issueKey} ↗
                            </JiraIssueLink>
                          ) : (
                            a.issueKey
                          )}
                          <span>Creation receipt recorded</span>
                          {!localMode && a.status === "created" && (
                            <button
                              className="secondary"
                              disabled={
                                disabled ||
                                !snapshot ||
                                !issueType ||
                                project !== a.issueKey.split("-")[0]
                              }
                              onClick={() => {
                                if (snapshot)
                                  void onCreate({
                                    snapshotId: snapshot.id,
                                    projectKey: project,
                                    issueTypeId: issueType,
                                    actionIds: [a.id],
                                    approved: true,
                                    receiptsOnly: true,
                                  });
                              }}
                            >
                              Check saved receipt for {a.issueKey}
                            </button>
                          )}
                        </p>
                      )}
                      {a.error && <div className="inline-error">{a.error}</div>}
                      {a.status === "uncertain" && (
                        <div className="inline-error">
                          <p>
                            Outcome needs reconciliation. A project
                            administrator can attach the existing Jira issue
                            after its approval marker is verified.
                          </p>
                          {!localMode && (
                            <div className="reconcile-controls">
                              <label>
                                Existing Jira key
                                <input
                                  value={reconcileKeys[a.id] ?? ""}
                                  onChange={(e) =>
                                    setReconcileKeys({
                                      ...reconcileKeys,
                                      [a.id]: e.target.value.toUpperCase(),
                                    })
                                  }
                                  placeholder="LZ-123"
                                />
                              </label>
                              <button
                                className="secondary"
                                disabled={disabled || !reconcileKeys[a.id]}
                                onClick={() =>
                                  void onReconcile(a.id, reconcileKeys[a.id])
                                }
                              >
                                Verify existing issue
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                  return index === 0 ||
                    a.issueKey ||
                    a.status === "uncertain" ? (
                    card
                  ) : (
                    <details className="more-proposal" key={a.id}>
                      <summary>
                        Review another proposal:{" "}
                        {a.recordIds.join(", ") || a.id}
                      </summary>
                      {card}
                    </details>
                  );
                })}
              </details>
            ),
          )}
          {!actions.length && (
            <Empty title="No proposed actions">
              No remediation suggestions are available for this saved drill.
            </Empty>
          )}
        </section>
        <aside className="panel approval-panel">
          <p className="eyebrow">HUMAN APPROVAL</p>
          <h2>Approve Jira follow-up</h2>
          {localMode && (
            <p className="field-help">
              Browser preview only. Jira creation requires a permitted Forge
              installation.
            </p>
          )}
          <p>
            Only the selected simulated-drill tasks will be created. No recall
            action is executed.
          </p>
          <label>
            Jira project
            <select
              disabled={localMode || disabled || !projects.length}
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setApproved(false);
                setChosen([]);
              }}
            >
              {!projects.length && (
                <option value="">
                  {localMode
                    ? "Unavailable in local mode"
                    : "No permitted projects found"}
                </option>
              )}
              {projects.length > 0 && (
                <option value="">Choose a permitted project</option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.key}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Issue type
            <select
              disabled={localMode || disabled || !types.length}
              value={issueType}
              onChange={(e) => {
                setIssueType(e.target.value);
                setApproved(false);
              }}
            >
              {!types.length && (
                <option value="">Select a permitted project</option>
              )}
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="approval-count">
            <strong>{chosen.length}</strong>
            <span>selected tasks · maximum 5 per approval</span>
          </div>
          <label className="checkbox-label approval-checkbox">
            <input
              type="checkbox"
              checked={approved}
              disabled={localMode || disabled}
              onChange={(e) => setApproved(e.target.checked)}
            />
            <span>
              I approve creation of these simulated-drill tasks in the selected
              Jira project.
            </span>
          </label>
          <button
            className="primary wide"
            disabled={
              localMode ||
              disabled ||
              !approved ||
              !chosen.length ||
              !project ||
              !issueType ||
              !snapshot
            }
            onClick={() => {
              if (snapshot)
                void onCreate({
                  snapshotId: snapshot.id,
                  projectKey: project,
                  issueTypeId: issueType,
                  actionIds: chosen,
                  approved: true,
                });
            }}
          >
            Create {chosen.length} Jira issues <Icon name="arrow" size={16} />
          </button>
          <p className="field-help">
            Retries use saved action identifiers. Unknown write outcomes stop
            for investigation.
          </p>
        </aside>
      </div>
    </>
  );
}
