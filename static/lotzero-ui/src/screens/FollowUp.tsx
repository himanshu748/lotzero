import type {ReturnTypeOfUseRehearsal} from '../types';
import JiraApproval from '../components/JiraApproval';
import AnalystHandoff from '../components/AnalystHandoff';
export default function FollowUp({desk}:{desk:ReturnTypeOfUseRehearsal}) {
  const snapshot=desk.active?.snapshot;if(!snapshot)return null;
  return <><h2>Follow-up</h2><p className="saved-reference">Saved <code>{snapshot.id}</code></p><JiraApproval actions={desk.active!.actions} snapshot={snapshot} defaultProjectKey={desk.data.project?.key} disabled={Boolean(desk.busy)} onCreate={async payload=>{await desk.create(payload);}} onReconcile={async(id,key)=>{await desk.reconcile(id,key);}} onReport={()=>document.getElementById('analyst-title')?.focus()}/><AnalystHandoff snapshot={snapshot} projectKey={desk.data.project?.key} saved local={desk.data.mode==='local'}/></>;
}
