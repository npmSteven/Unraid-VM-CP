import type { Component } from 'solid-js';

import { VMCard } from './components/VMCard/VMCard';

export const App: Component = () => {
  return (
    <div
      style={{ display: 'flex' }}
    >
      <VMCard
        status='started'
        name='Steven-PC'
        os='Windows 11'
        storage='1tb'
        memory='1024M'
        cpus='6'
        graphics='RTX3080Ti'
        ip='192.168.1.150'
        isAutoStart={false}
      />
      <VMCard
        status='started'
        name='Steven-PC'
        os='Windows 11'
        storage='1tb'
        memory='1024M'
        cpus='6'
        graphics='RTX3080Ti'
        ip='192.168.1.150'
        isAutoStart={false}
      />
    </div>
  );
};
