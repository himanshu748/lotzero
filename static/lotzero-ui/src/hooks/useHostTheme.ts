import { useEffect } from "react";
import { setGlobalTheme } from "@atlaskit/tokens/set-global-theme";
import { localMode } from "../client";

export function useHostTheme() {
  useEffect(() => {
    if (localMode) {
      let cancelled = false;
      let unbind: (() => void) | undefined;
      void setGlobalTheme({
        colorMode: "auto",
        light: "light",
        dark: "dark",
        typography: "typography",
      })
        .then((cleanup) => {
          if (cancelled) cleanup();
          else unbind = cleanup;
        })
        .catch(() => {
          /* Readable CSS fallbacks remain available. */
        });
      return () => {
        cancelled = true;
        unbind?.();
      };
    }
    void import("@forge/bridge")
      .then(({ view }) => view.theme.enable())
      .catch(() => {
        // A theme failure never changes data or activates a service.
      });
  }, []);
}
