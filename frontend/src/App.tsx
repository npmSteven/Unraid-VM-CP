import { Route, Routes } from '@solidjs/router';
import { Component } from 'solid-js';

// Pages
import Users from './pages/Users/Users';
import VMs from './pages/VMs/VMs';
import Login from './pages/Login/Login';
import CreateUser from './pages/CreateUser/CreateUser';

export const App: Component = () => {
  return (
    <Routes>
      <Route path='/login' component={Login} />
      <Route path='/vms' component={VMs} />
      <Route path='/users' component={Users} />
      <Route path='/users/:userId/vms' component={VMs} />
      <Route path='/users/create' component={CreateUser} />
    </Routes>
  );
};
