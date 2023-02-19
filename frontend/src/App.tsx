import { Component } from 'solid-js';
import { Navbar } from './components/Navbar/Navbar';
import { UserCard } from './components/UserCard/UserCard';

import { VMCard } from './components/VMCard/VMCard';
import { Login } from './pages/Login/Login';

export const App: Component = () => {
  return (
    <div>
      {/* <Login /> */}
        <Navbar />
      <div
        style={{ display: 'flex', "flex-wrap": 'wrap', "justify-content": 'center' }}
      >
        <VMCard
          status='started'
          name='Steven-PC'
          os='Windows 11'
          storage='1tb'
          memory='1024M'
          cpus='6'
          graphics='RTX3080Ti'
          isAutoStart={false}
        />
        <VMCard
          status='paused'
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
          status='stopped'
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
    </div>
  );
};
