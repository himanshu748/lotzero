export function recoveryFor(error: string): {message: string; action: 'refresh' | 'records' | 'review'} {
  if (/uncertain|receipt|claim|conflict|mutation lock|in progress|another request/i.test(error)) return {message: 'Refresh saved state and inspect Jira action receipts. An uncertain outcome needs reconciliation; do not create a replacement Task.', action: 'refresh'};
  if (/permission|access denied|authenticated|administrator/i.test(error)) return {message: 'Ask your Jira administrator to check project access. Loading records requires project administration; creating Tasks also requires Create Issues. Refresh after access changes.', action: 'refresh'};
  if (/dataset|import|source|JSON|format/i.test(error)) return {message: 'Return to your records and check the import format or source lot. Existing records are kept; no automatic reset is performed.', action: 'records'};
  if (/storage|quota|localStorage|saved browser|read|load|fetch|network|unavailable|installation/i.test(error)) return {message: 'Check connectivity and storage access, then refresh saved state. Refresh does not repeat a Jira write or delete stored data.', action: 'refresh'};
  return {message: 'Review the current rehearsal before trying again. If a Jira outcome is uncertain, inspect its saved receipt first.', action: 'review'};
}
