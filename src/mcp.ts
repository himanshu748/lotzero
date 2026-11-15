import {getAppContext} from '@forge/api';
import {handler as readSavedRehearsal} from './rovo';

/** MCP has its own gate; the existing Rovo agent and Jira resolver are unchanged. */
export async function handler(payload: unknown, context: Parameters<typeof readSavedRehearsal>[1]) {
  // Only the exact server-side value enables the tool. Payloads cannot opt in.
  if (process.env.LOTZERO_MCP_ENABLED !== 'true') return disabled();
  try {
    // This increment is approved for development only. Even an accidental flag
    // in staging or production must not expose saved rehearsal evidence.
    if (getAppContext().environmentType !== 'DEVELOPMENT') return disabled();
  } catch {
    return {ok: false, readOnly: true, error: {code: 'SCOPE_UNAVAILABLE', message: 'A verified Forge development installation is required.'}};
  }
  // Reuse principal-only auth, asUser Browse checks, installation-partitioned
  // storage, exact revision validation, deterministic results and output bounds.
  return readSavedRehearsal(payload, context);
}

function disabled() {
  return {ok: false, readOnly: true, error: {code: 'FEATURE_DISABLED', message: 'MCP rehearsal reads are disabled for this installation.'}};
}
