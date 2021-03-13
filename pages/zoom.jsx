import React from 'react';
import dynamic from 'next/dynamic';

const ZoomInner = dynamic(import('../src/components/Zoom'), { ssr: false });

const Zoom = () => {
  return <ZoomInner />;
};

export default Zoom;
