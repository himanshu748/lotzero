import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { syntheticDataset } from "../../fixtures/synthetic/dataset";
import { runDrill } from "../../src/graph/engine";
import Impact from "../../static/lotzero-ui/src/components/Impact";

// Atlaskit's browser CSS loader is outside this server-rendered state guard.
vi.mock("@atlaskit/lozenge", () => ({
  default: ({ children }: { children: ReactNode }) => createElement("span", null, children),
}));

const result = runDrill(syntheticDataset, {
  sourceLotId: "ING-F01",
  hazard: "contamination",
  at: "2026-10-28T09:00:00Z",
  assertions: ["shipment-destination"],
});

describe("evidence view without a supporting record", () => {
  it.each(["", "NOT-A-RECORD"])("handles a restored backward view for %j without invoking invalid traversal", (selected) => {
    const html = renderToStaticMarkup(createElement(Impact, {
      dataset: syntheticDataset,
      result,
      initialView: { selected, pathTarget: selected, mode: "graph", direction: "backward" },
    }));
    expect(html).toContain("Select a record to trace its origins");
  });

  it("keeps a disconnected record inspectable without inventing a source path", () => {
    const html = renderToStaticMarkup(createElement(Impact, {
      dataset: syntheticDataset,
      result,
      initialView: { selected: "FG-404", pathTarget: "FG-404", mode: "path", direction: "forward" },
    }));
    expect(html).toContain("No supporting path to");
    expect(html).toContain("Unresolved snack lot 404");
    expect(html).toContain("No complete source path is recorded.");
    expect(html).not.toContain('class="path-steps"');
  });
});
