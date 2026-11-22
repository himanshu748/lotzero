import { useState } from "react";
import Button from "@atlaskit/button/new";

export default function EvidenceComment({
  issueKey,
  paragraphs,
  disabled,
  onPost,
}: {
  issueKey: string;
  paragraphs: string[];
  disabled: boolean;
  onPost: () => Promise<{ status: "posted" | "uncertain"; error?: string }>;
}) {
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  return (
    <details className="evidence-comment">
      <summary>Post evidence comment on {issueKey}</summary>
      <p className="field-help">
        Exact comment text, built from the saved rehearsal. Nothing is posted
        until you approve it.
      </p>
      <blockquote>
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </blockquote>
      <label>
        <input
          type="checkbox"
          checked={approved}
          disabled={disabled || busy || Boolean(result)}
          onChange={(event) => setApproved(event.target.checked)}
        />{" "}
        I approve posting this exact comment to {issueKey}
      </label>
      <div className="button-row">
        <Button
          appearance="primary"
          isDisabled={!approved || disabled || busy || Boolean(result)}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const receipt = await onPost();
              setResult(
                receipt.status === "posted"
                  ? `Evidence comment posted on ${issueKey}.`
                  : (receipt.error ?? "Outcome unknown. Check the task comments."),
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "The comment was not posted.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Post comment
        </Button>
      </div>
      {result && <p role="status">{result}</p>}
      {error && <div className="inline-error" role="alert">{error}</div>}
    </details>
  );
}
