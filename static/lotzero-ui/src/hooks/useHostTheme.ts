import {useEffect} from 'react';
import {setGlobalTheme} from '@atlaskit/tokens/set-global-theme';
import {localMode} from '../client';

export function useHostTheme() {
  useEffect(()=>{
    if(localMode){void setGlobalTheme({colorMode:'light',light:'light',dark:'dark',typography:'typography'});return;}
    void import('@forge/bridge').then(({view})=>view.theme.enable()).catch(()=>{
      // Keep readable token fallbacks; a theme failure never changes data or activates a service.
    });
  },[]);
}
