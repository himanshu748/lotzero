import type {ReturnTypeOfUseRehearsal} from '../types';
import FindingsList from '../components/FindingsList';
import Impact from '../components/Impact';
import Button from '@atlaskit/button/new';
export default function Rehearsal({desk}:{desk:ReturnTypeOfUseRehearsal}) {
  const active=desk.active;if(!active)return null;
  return <><div className="rehearsal-layout"><FindingsList result={active.result} selected={desk.selectedFinding} onSelect={desk.selectFinding} focusKey={desk.focusKey}/><section id="rehearsal-evidence" className="evidence-region" aria-label="Evidence"><Impact key={desk.focusKey} dataset={active.dataset} result={active.result} initialView={desk.evidenceView.current} selectionRequest={desk.selectionRequest} onViewChange={state=>{desk.evidenceView.current=state;}}/></section></div><div className="case-actions"><Button isDisabled={Boolean(desk.busy)} onClick={()=>desk.go('rehearse')}>Rehearse a hold</Button><Button appearance="primary" isDisabled={Boolean(desk.busy)} onClick={desk.followUp}>Save and follow up</Button></div></>;
}
