//app/components/context/MicContext.js
import React, { createContext, useContext, useState } from 'react';

const MicContext = createContext();

export const useMic = () => useContext(MicContext);

export const MicProvider = ({ children }) => {
  const [activeMic, setActiveMic] = useState(null);

  return (
    <MicContext.Provider value={{ activeMic, setActiveMic }}>
      {children}
    </MicContext.Provider>
  );
};