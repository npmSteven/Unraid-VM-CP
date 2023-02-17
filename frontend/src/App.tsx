import type { Component } from 'solid-js';

import { VMCard } from './components/VMCard/VMCard';
import { VMStatus } from './components/VMStatus/VMStatus';

export const App: Component = () => {
  return (
    <div
      style={{
        margin: '5px',
      }}
    >
      <VMCard />
    </div>
  );
};
