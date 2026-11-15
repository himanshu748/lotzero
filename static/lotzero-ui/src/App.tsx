import {useEffect,useRef} from 'react';
import Button from '@atlaskit/button/new';
import {useRehearsal} from './hooks/useRehearsal';
import {useHostTheme} from './hooks/useHostTheme';
import AppShell from './components/AppShell';
import CaseHeader from './components/CaseHeader';
import Home from './screens/Home';
import Rehearsal from './screens/Rehearsal';
import Rehearse from './screens/Rehearse';
import FollowUp from './screens/FollowUp';
import NewDrillForm from './screens/NewDrillForm';
import {recoveryFor} from './recovery';

export default function App() {
  const desk=useRehearsal();useHostTheme();const heading=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(desk.screen!=='rehearsal'){heading.current?.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});},[desk.screen]);
  const active=desk.active;
  return <AppShell screen={desk.screen} onHome={()=>desk.go('home')} onNavigate={desk.go} saved={Boolean(active?.snapshot)} active={Boolean(active)}>
    {desk.error&&<div role="alert" className="error-message"><strong>{desk.error}</strong><p>{recoveryFor(desk.error).message}</p><Button isDisabled={Boolean(desk.busy)} onClick={()=>void desk.perform('Refreshing saved state',desk.refresh)}>Refresh saved state</Button></div>}
    <div role="status" aria-live="polite" className="operation-status">{desk.busy||desk.notice}</div>
    <div ref={heading}>
    {desk.screen==='home'?<Home desk={desk}/>:desk.screen==='new'&&desk.data.dataset?<><Button onClick={()=>desk.go('home')}>Back to Home</Button><h1 tabIndex={-1}>New drill</h1><NewDrillForm dataset={desk.data.dataset} onRun={desk.run} disabled={Boolean(desk.busy)}/></>:active?<>
      <CaseHeader result={active.result} snapshot={active.snapshot}/>
      <nav className="case-navigation" aria-label="Rehearsal navigation">
        <button aria-current={desk.screen==='rehearsal'?'step':undefined} onClick={()=>desk.go('rehearsal')}>Trace</button>
        <button onClick={()=>{desk.go('rehearsal');requestAnimationFrame(()=>document.querySelector<HTMLElement>('.finding-row.selected')?.focus());}}>Findings</button>
        <button aria-current={desk.screen==='rehearse'?'step':undefined} onClick={()=>desk.go('rehearse')}>Rehearse</button>
        <button aria-current={desk.screen==='follow-up'?'step':undefined} disabled={!active.snapshot} title={!active.snapshot?'Save and follow up first':undefined} onClick={()=>desk.go('follow-up')}>Follow-up</button>
      </nav>
      {desk.screen==='rehearsal'?<Rehearsal desk={desk}/>:desk.screen==='rehearse'?<><h2>Rehearse</h2><Rehearse dataset={active.dataset} result={active.result} onUpdate={desk.update} onReview={desk.followUp} busy={Boolean(desk.busy)} suggestedTarget={desk.suggestedTarget}/></>:<FollowUp desk={desk}/>}
    </>:null}
    </div>
    {desk.confirmation&&<section role="alertdialog" aria-modal="true" aria-labelledby="replace-title" className="dialog-backdrop"><div className="dialog"><h2 id="replace-title">Keep or replace the current work?</h2><p>{desk.confirmation.message}</p><div className="button-row"><Button autoFocus onClick={()=>desk.setConfirmation(null)}>Keep current work</Button><Button appearance="danger" onClick={desk.confirmation.accept}>Replace current work</Button></div></div></section>}
  </AppShell>;
}
