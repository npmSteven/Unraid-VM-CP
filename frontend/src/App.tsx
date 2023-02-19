import { Route, Routes } from '@solidjs/router';
import { Component, lazy } from 'solid-js';

// Pages
const Users = lazy(() => import('./pages/Users/Users'));
const VMs = lazy(() => import('./pages/VMs/VMs'));
const Login = lazy(() => import('./pages/Login/Login'));
const CreateUser = lazy(() => import('./pages/CreateUser/CreateUser'));

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
