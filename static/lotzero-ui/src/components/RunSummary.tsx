import type {Snapshot} from '../../../../src/contracts';
import {summarizeRehearsal} from '../../../../src/scenarios/summary';
import {Badge} from './Primitives';

export default function RunSummary({snapshot, onInspect, onSave, disabled}: {snapshot: Snapshot; onInspect?: () => void; onSave?: () => void; disabled?: boolean}) {
  const summary = summarizeRehearsal(snapshot);
  const finding = summary.blocking.find(item => item.status === 'FAIL') ?? summary.blocking[0];
  const example = finding?.firstCounterexample;
  return <section className="run-summary panel" aria-label="Rehearsal summary">
    <div className="summary-heading"><div><p className="eyebrow">YOUR REHEARSAL AT A GLANCE</p><h2>What the records establish</h2></div><span className="mono">{summary.sourceLotId}</span></div>
    <dl className="summary-metrics">
      <div><dt>Product lots traced</dt><dd>{summary.productLots}</dd></div>
      <div><dt>Shipments associated</dt><dd>{summary.shipments}</dd></div>
      <div><dt>Assertions</dt><dd className="summary-statuses"><span>{summary.assertions.pass} PASS</span><span>{summary.assertions.fail} FAIL</span><span>{summary.assertions.unknown} UNKNOWN</span></dd></div>
      <div><dt>Follow-up actions</dt><dd>{summary.actions.open} open <small>· {summary.actions.created} created · {summary.actions.uncertain} uncertain</small></dd></div>
    </dl>
    <div className="summary-finding">
      {finding ? <div><Badge value={finding.status}/><strong>{finding.title}</strong><p>{example?.message ?? 'Inspect this assertion for its missing evidence.'}</p><p className="mono">{example?.recordIds.join(' → ') || 'No record identified'} · Evidence: {example?.evidence.join(', ') || 'Not recorded'}</p></div> : <div><Badge value="PASS"/><strong>Configured assertions passed</strong><p>This does not establish product safety or complete traceability beyond the supplied records.</p></div>}
      {(onInspect || onSave) && <div className="summary-actions">{onInspect && <button className="secondary" disabled={disabled} onClick={onInspect}>Inspect first finding</button>}{onSave && <button className="secondary" disabled={disabled} onClick={onSave}>Save & review report</button>}</div>}
    </div>
    <p className="summary-timing"><strong>{summary.timing.label}.</strong> {summary.timing.reason} Open actions include unapproved proposals and uncertain outcomes; reconcile uncertain outcomes before retrying. Proposals are bounded to 20 and require review before creation.</p>
  </section>;
}
