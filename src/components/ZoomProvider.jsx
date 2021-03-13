import React, { useEffect } from 'react';
import ZoomContext from '../context/zoom-context';
import ZoomMtgCm from '@zoomus/instantsdk';

const ZoomProvider = ({ children }) => {
  useEffect(() => {
    window.zmClient = ZoomMtgCm.createClient();
  });

  return (
    <ZoomContext.Provider value={window.zmClient}>
      {children}
    </ZoomContext.Provider>
  );
};

export default ZoomProvider;
