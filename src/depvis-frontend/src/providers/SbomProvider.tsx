import { observer } from 'mobx-react-lite';
import React from 'react';
import { createContext, useContext } from 'react';
import { SbomStore } from '../stores/SbomStore';

const SbomContext = createContext<SbomStore>(new SbomStore());

export const SbomProvider = observer(({ children }: any) => {
  const sbomStore = new SbomStore();

  return <SbomContext.Provider value={sbomStore}>{children}</SbomContext.Provider>;
});

export const useSbomStore = () => useContext(SbomContext);
