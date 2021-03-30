import React from 'react';
import { useRouter } from 'next/router';

const Jitsi = () => {
  const jitsiContainerId = 'jitsi-container-id';
  const router = useRouter();
  const [jitsi, setJitsi] = React.useState({});
  const { roomName, signature, subject } = router.query;

  const loadJitsiScript = () => {
    let resolveLoadJitsiScriptPromise = null;

    const loadJitsiScriptPromise = new Promise((resolve) => {
      resolveLoadJitsiScriptPromise = resolve;
    });

    const script = document.createElement('script');
    script.src = 'https://8x8.vc/external_api.js';
    script.async = true;
    script.onload = resolveLoadJitsiScriptPromise;
    document.body.appendChild(script);

    return loadJitsiScriptPromise;
  };

  const initialiseJitsi = async () => {
    if (!window.JitsiMeetExternalAPI) {
      await loadJitsiScript();
    }

    const _jitsi = new window.JitsiMeetExternalAPI('8x8.vc', {
      roomName,
      jwt: signature,
      configOverwrite: {
        ...(subject) && { subject },
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: true
      },
      parentNode: document.getElementById(jitsiContainerId),
    });

    setJitsi(_jitsi);
  };

  React.useEffect(() => {
    initialiseJitsi();

    return () => jitsi?.dispose?.();
  }, []);

  return <div id={jitsiContainerId} style={{ height: '100vh', width: '100%' }} />;
};

export default Jitsi;
