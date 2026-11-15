import type {ReactNode} from 'react';
import type {Screen} from '../hooks/useRehearsal';
import {localMode} from '../client';

export default function AppShell({screen,onHome,onNavigate,saved,active,children}:{screen:Screen;onHome:()=>void;onNavigate:(screen:Screen,view?:'trace'|'findings')=>void;saved:boolean;active:boolean;children:ReactNode}) {
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to rehearsal</a><header className="app-bar"><button className="brand-link" onClick={onHome} aria-label="LotZero Home">LotZero</button><span className="transport-hint">{localMode?'Browser preview · Jira writes disabled':'Jira · Recall rehearsal'}</span><span className="synthetic-hint">Simulation only</span></header><main id="main" tabIndex={-1}>{children}</main><footer className="app-footer">Synthetic rehearsal. No operational recall is performed.</footer></div>;
}
